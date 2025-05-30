import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import MultipleSelector, { type Option } from "@/components/ui/multiselect";
import { Slider } from "@/components/ui/slider";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface AdvancedFilterField {
  id: string;
  label: string;
  type: FieldType;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export enum FieldType {
  TEXT = "text",
  NUMBER = "number",
  SELECT = "select",
  DATE_RANGE = "date-range",
  SLIDER = "slider",
}

interface AdvancedFiltersProps {
  appliedFilters: Record<string, unknown>;
  onChange: (filters: Record<string, unknown>) => void;
  fields: AdvancedFilterField[];
}

const createFormSchema = (fields: AdvancedFilterField[]) => {
  const schemaObject: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    switch (field.type) {
      case FieldType.TEXT:
        schemaObject[field.id] = z.string().optional();
        break;
      case FieldType.NUMBER:
        schemaObject[field.id] = z.number().optional();
        break;
      case FieldType.SELECT:
        schemaObject[field.id] = z
          .array(
            z.object({
              value: z.string(),
              label: z.string(),
            })
          )
          .optional();
        break;
      case FieldType.DATE_RANGE:
        schemaObject[field.id] = z
          .object({
            from: z.date().optional(),
            to: z.date().optional(),
          })
          .optional();
        break;
      case FieldType.SLIDER:
        schemaObject[field.id] = z.array(z.number()).optional();
        break;
    }
  });

  return z.object(schemaObject);
};

const getDefaultValues = (
  fields: AdvancedFilterField[],
  filters: Record<string, unknown>
) => {
  const defaults: Record<string, unknown> = {};

  fields.forEach((field) => {
    switch (field.type) {
      case FieldType.TEXT: {
        defaults[field.id] = (filters[field.id] as string) || "";
        break;
      }
      case FieldType.NUMBER: {
        defaults[field.id] = filters[field.id] || undefined;
        break;
      }
      case FieldType.SELECT: {
        const selectValues = filters[field.id] as string[];
        defaults[field.id] =
          selectValues?.map((value) => ({ value, label: value })) || [];
        break;
      }
      case FieldType.DATE_RANGE: {
        defaults[field.id] = filters[field.id] || {
          from: undefined,
          to: undefined,
        };
        break;
      }
      case FieldType.SLIDER: {
        defaults[field.id] = (filters[field.id] as number[]) || [
          field.min ?? 0,
          field.max ?? 100,
        ];
        break;
      }
    }
  });

  return defaults;
};

const cleanFieldValue = (
  field: AdvancedFilterField,
  value: unknown
): unknown => {
  switch (field.type) {
    case FieldType.TEXT: {
      return value && String(value).trim() !== "" ? value : undefined;
    }

    case FieldType.NUMBER: {
      return value !== undefined && value !== null ? value : undefined;
    }

    case FieldType.SELECT: {
      const selectValue = value as Option[];
      return selectValue?.length > 0
        ? selectValue.map((opt) => opt.value)
        : undefined;
    }

    case FieldType.DATE_RANGE: {
      const dateRange = value as DateRange;
      return dateRange?.from || dateRange?.to ? dateRange : undefined;
    }

    case FieldType.SLIDER: {
      const sliderValue = value as number[];
      return sliderValue &&
        (sliderValue[0] !== field.min || sliderValue[1] !== field.max)
        ? sliderValue
        : undefined;
    }

    default:
      return undefined;
  }
};

const transformFiltersForBackend = (
  filters: Record<string, unknown>,
  fields: AdvancedFilterField[]
): Record<string, unknown> => {
  const backendFilters: Record<string, unknown> = {};

  Object.entries(filters).forEach(([key, value]) => {
    const field = fields.find((f) => f.id === key);
    if (!field || value === undefined || value === null) return;

    switch (field.type) {
      case FieldType.TEXT:
      case FieldType.NUMBER:
        if (value && String(value).trim() !== "") {
          backendFilters[key] = value;
        }
        break;

      case FieldType.SELECT: {
        const selectValue = value as Option[];
        if (selectValue && selectValue.length > 0) {
          backendFilters[key] = selectValue.map((option) => option.value);
        }
        break;
      }

      case FieldType.DATE_RANGE: {
        const dateRange = value as DateRange;
        if (dateRange?.from) {
          backendFilters[`${key}From`] = dateRange.from.toISOString();
        }
        if (dateRange?.to) {
          backendFilters[`${key}To`] = dateRange.to.toISOString();
        }
        break;
      }

      case FieldType.SLIDER: {
        const sliderValue = value as number[];
        if (sliderValue && sliderValue.length === 2) {
          if (key === "latency_ms") {
            if (sliderValue[0] !== field.min) {
              backendFilters["latencyMin"] = sliderValue[0];
            }
            if (sliderValue[1] !== field.max) {
              backendFilters["latencyMax"] = sliderValue[1];
            }
          } else if (key === "cost_usd") {
            if (sliderValue[0] !== field.min) {
              backendFilters["costMin"] = sliderValue[0];
            }
            if (sliderValue[1] !== field.max) {
              backendFilters["costMax"] = sliderValue[1];
            }
          } else {
            backendFilters[`${key}Min`] = sliderValue[0];
            backendFilters[`${key}Max`] = sliderValue[1];
          }
        }
        break;
      }
    }
  });

  return backendFilters;
};

export function AdvancedFilters({
  appliedFilters,
  onChange,
  fields,
}: AdvancedFiltersProps) {
  const { t } = useTranslation();
  const schema = React.useMemo(() => createFormSchema(fields), [fields]);
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(
    undefined
  );

  const [pendingFilters, setPendingFilters] = React.useState<
    Record<string, unknown>
  >({});

  const [datePopoverStates, setDatePopoverStates] = React.useState<
    Record<string, boolean>
  >({});

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(fields, appliedFilters),
  });

  React.useEffect(() => {
    const newDefaults = getDefaultValues(fields, appliedFilters);
    form.reset(newDefaults);
    setPendingFilters({});
  }, [appliedFilters, fields, form]);

  const handleInternalChange = React.useCallback(
    (values: Record<string, unknown>) => {
      const cleanedValues: Record<string, unknown> = {};

      Object.entries(values).forEach(([key, value]) => {
        const field = fields.find((f) => f.id === key);
        if (!field) return;

        const cleanedValue = cleanFieldValue(field, value);
        if (cleanedValue !== undefined) {
          cleanedValues[key] = cleanedValue;
        }
      });

      setPendingFilters(cleanedValues);
    },
    [fields]
  );

  const handleDebouncedChange = React.useCallback(
    (fieldId: string, value: unknown) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        handleInternalChange({ ...form.getValues(), [fieldId]: value });
      }, 300);
    },
    [form, handleInternalChange]
  );

  const setDatePopoverOpen = React.useCallback(
    (fieldId: string, isOpen: boolean) => {
      setDatePopoverStates((prev) => ({ ...prev, [fieldId]: isOpen }));
    },
    []
  );

  const handleApply = React.useCallback(() => {
    const backendFilters = transformFiltersForBackend(pendingFilters, fields);
    onChange(backendFilters);
  }, [pendingFilters, fields, onChange]);

  const handleClear = React.useCallback(() => {
    form.reset(getDefaultValues(fields, {}));
    setPendingFilters({});
    onChange({});
  }, [form, fields, onChange]);

  const renderField = (field: AdvancedFilterField) => {
    switch (field.type) {
      case FieldType.TEXT: {
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      "dataTableFilter.advancedFilters.placeholder.text",
                      {
                        field: field.label.toLowerCase(),
                      }
                    )}
                    {...formField}
                    onChange={(e) => {
                      formField.onChange(e);
                      handleDebouncedChange(field.id, e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      }

      case FieldType.NUMBER: {
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t(
                      "dataTableFilter.advancedFilters.placeholder.number",
                      {
                        field: field.label.toLowerCase(),
                      }
                    )}
                    {...formField}
                    onChange={(e) => {
                      const value = e.target.value
                        ? Number(e.target.value)
                        : undefined;
                      formField.onChange(value);
                      handleDebouncedChange(field.id, value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      }

      case FieldType.SELECT: {
        const selectOptions: Option[] =
          field.options?.map((option) => ({
            value: option,
            label: option,
          })) || [];

        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <MultipleSelector
                    value={formField.value || []}
                    onChange={(selected) => {
                      formField.onChange(selected);
                      handleInternalChange({
                        ...form.getValues(),
                        [field.id]: selected,
                      });
                    }}
                    defaultOptions={selectOptions}
                    placeholder={t(
                      "dataTableFilter.advancedFilters.placeholder.select",
                      {
                        field: field.label.toLowerCase(),
                      }
                    )}
                    emptyIndicator={
                      <p className="text-center text-gray-600 dark:text-gray-400">
                        {t("dataTableFilter.advancedFilters.empty.select")}
                      </p>
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      }

      case FieldType.DATE_RANGE: {
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <Popover
                  open={datePopoverStates[field.id] || false}
                  onOpenChange={(isOpen) =>
                    setDatePopoverOpen(field.id, isOpen)
                  }
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {formField.value?.from ? (
                          formField.value.to ? (
                            <>
                              {formField.value.from.toLocaleDateString()} -{" "}
                              {formField.value.to.toLocaleDateString()}
                            </>
                          ) : (
                            formField.value.from.toLocaleDateString()
                          )
                        ) : (
                          <span>
                            {t(
                              "dataTableFilter.advancedFilters.placeholder.dateRange"
                            )}
                          </span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={formField.value}
                      onSelect={(range) => {
                        formField.onChange(range);
                        handleInternalChange({
                          ...form.getValues(),
                          [field.id]: range,
                        });
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      }

      case FieldType.SLIDER: {
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>
                  {field.label} ({formField.value?.[0]} - {formField.value?.[1]}
                  )
                </FormLabel>
                <FormControl>
                  <Slider
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={
                      formField.value || [field.min ?? 0, field.max ?? 100]
                    }
                    onValueChange={(value) => {
                      formField.onChange(value);
                      handleInternalChange({
                        ...form.getValues(),
                        [field.id]: value,
                      });
                    }}
                    showTooltip
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4">
        <div className="space-y-4">
          {fields.map((field) => renderField(field))}
        </div>
        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={handleClear}>
            {t("dataTableFilter.clear")}
          </Button>
          <Button type="button" variant="default" onClick={handleApply}>
            {t("dataTableFilter.advancedFilters.apply")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
