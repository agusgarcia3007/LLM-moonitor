import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { t } from "i18next";
import { Menu, X } from "lucide-react";
import React from "react";
import { ThemeSwitch } from "../layout/theme-switch";

const menuItems = [
  { name: "Features", href: "/#features" },
  { name: "Pricing", href: "/#pricing" },
  { name: "About", href: "/about" },
];

function isAuthenticated() {
  return (
    typeof document !== "undefined" &&
    document.cookie.includes("isAuthenticated=true")
  );
}

export const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className={cn(
          "fixed z-20 w-full transition-all duration-300",
          isScrolled &&
            "bg-background/75 border-b border-black/5 backdrop-blur-lg"
        )}
      >
        <div className="mx-auto max-w-5xl px-6">
          <div
            className={cn(
              "relative flex flex-wrap items-center justify-between gap-6 py-6 transition-all duration-200 lg:gap-0",
              isScrolled && "py-3"
            )}
          >
            <div className="flex w-full justify-between gap-6 lg:w-auto">
              <Link
                to="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <img
                  src="/logo.svg"
                  alt="logo"
                  className="size-7 dark:invert"
                />
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>

              <div className="m-auto hidden size-fit lg:block">
                <ul className="flex gap-1">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Button asChild variant="ghost" size="sm">
                        <Link to={item.href} className="text-base">
                          <span>{item.name}</span>
                        </Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        to={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                {isAuthenticated() ? (
                  <>
                    <Button asChild size="sm">
                      <Link to="/dashboard" search={{ period: "1" }}>
                        <span>{t("landing.header.dashboard")}</span>
                      </Link>
                    </Button>
                    <ThemeSwitch />
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className={cn(isScrolled && "lg:hidden")}
                    >
                      <Link to="/login">
                        <span>{t("landing.header.login")}</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className={cn(isScrolled && "lg:hidden")}
                    >
                      <Link
                        to="/signup"
                        search={{ plan: undefined, period: undefined }}
                      >
                        <span>{t("landing.header.signUp")}</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className={cn(isScrolled ? "lg:inline-flex" : "hidden")}
                    >
                      <Link
                        to="/signup"
                        search={{ plan: undefined, period: undefined }}
                      >
                        <span>{t("landing.header.getStarted")}</span>
                      </Link>
                    </Button>
                    <ThemeSwitch />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
