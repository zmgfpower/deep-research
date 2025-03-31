"use client";
import { useLayoutEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Password } from "@/components/Internal/PasswordInput";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectLabel,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import useModel from "@/hooks/useModel";
import { useSettingStore } from "@/store/setting";
import {
  GEMINI_BASE_URL,
  OPENROUTER_BASE_URL,
  OPENAI_BASE_URL,
  TAVILY_BASE_URL,
  FIRECRAWL_BASE_URL,
} from "@/constants/urls";
import {
  filterThinkingModelList,
  filterNetworkingModelList,
  filterOpenRouterModelList,
} from "@/utils/models";
import { cn } from "@/utils/style";
import { omit, capitalize } from "radash";

type SettingProps = {
  open: boolean;
  onClose: () => void;
};

const BUILD_MODE = process.env.NEXT_PUBLIC_BUILD_MODE;
const VERSION = process.env.NEXT_PUBLIC_VERSION;

const formSchema = z.object({
  provider: z.string(),
  mode: z.string().optional(),
  apiKey: z.string().optional(),
  apiProxy: z.string().optional(),
  accessPassword: z.string().optional(),
  thinkingModel: z.string(),
  networkingModel: z.string(),
  enableSearch: z.string(),
  searchProvider: z.string().optional(),
  searchApiKey: z.string().optional(),
  searchApiProxy: z.string().optional(),
  searchMaxResult: z.number().optional(),
  language: z.string().optional(),
  theme: z.string().optional(),
});

function convertModelName(name: string) {
  return name
    .replaceAll("/", "-")
    .split("-")
    .map((word) => capitalize(word))
    .join(" ");
}

let preLoading = false;

function Setting({ open, onClose }: SettingProps) {
  const { t } = useTranslation();
  const { mode, provider, searchProvider, update } = useSettingStore();
  const { modelList, refresh } = useModel();
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const thinkingModelList = useMemo(() => {
    const { provider } = useSettingStore.getState();
    if (provider === "google") {
      return filterThinkingModelList(modelList);
    } else if (provider === "openrouter") {
      return filterOpenRouterModelList(modelList);
    }
    return [[], modelList];
  }, [modelList]);
  const networkingModelList = useMemo(() => {
    const { provider } = useSettingStore.getState();
    if (provider === "google") {
      return filterNetworkingModelList(modelList);
    } else if (provider === "openrouter") {
      return filterOpenRouterModelList(modelList);
    }
    return [[], modelList];
  }, [modelList]);
  const baseUrlPlaceholder = useMemo(() => {
    if (provider === "google") {
      return GEMINI_BASE_URL;
    } else if (provider === "openrouter") {
      return OPENROUTER_BASE_URL;
    } else if (provider === "openai") {
      return OPENAI_BASE_URL;
    } else {
      return t("setting.apiUrlPlaceholder");
    }
  }, [provider, t]);
  const searchBaseUrlPlaceholder = useMemo(() => {
    if (searchProvider === "tavily") {
      return TAVILY_BASE_URL;
    } else if (searchProvider === "firecrawl") {
      return FIRECRAWL_BASE_URL;
    } else {
      return t("setting.apiUrlPlaceholder");
    }
  }, [searchProvider, t]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: async () => {
      return new Promise((resolve) => {
        const state = useSettingStore.getState();
        resolve({ ...omit(state, ["update"]) });
      });
    },
  });

  function handleClose(open: boolean) {
    if (!open) onClose();
  }

  function handleSubmit(values: z.infer<typeof formSchema>) {
    update(values);
    onClose();
  }

  const fetchModelList = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  function handleValueChange() {
    update({
      apiKey: form.getValues("apiKey"),
      apiProxy: form.getValues("apiProxy"),
      accessPassword: form.getValues("accessPassword"),
    });
  }

  function handleModeChange(mode: string) {
    update({ mode });
  }

  async function handleProviderChange(provider: string) {
    update({ provider });
    await fetchModelList();
  }

  async function handleSearchProviderChange(searchProvider: string) {
    update({ searchProvider });
  }

  useLayoutEffect(() => {
    if (open && !preLoading) {
      fetchModelList();
      preLoading = true;
    }
  }, [open, fetchModelList]);

  useLayoutEffect(() => {
    if (open && mode === "") {
      const { apiKey, accessPassword, update } = useSettingStore.getState();
      const requestMode = !apiKey && accessPassword ? "proxy" : "local";
      update({ mode: requestMode });
      form.setValue("mode", requestMode);
    }
  }, [open, mode, form]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md print:hidden">
        <DialogHeader>
          <DialogTitle>{t("setting.title")}</DialogTitle>
          <DialogDescription>{t("setting.description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4">
            <Tabs defaultValue="llm">
              <TabsList
                className={cn("w-full mb-1", {
                  hidden: BUILD_MODE === "export",
                })}
              >
                <TabsTrigger className="w-1/3" value="llm">
                  {t("setting.model")}
                </TabsTrigger>
                <TabsTrigger className="w-1/3" value="search">
                  Search
                </TabsTrigger>
                <TabsTrigger className="w-1/3" value="general">
                  {t("setting.general")}
                </TabsTrigger>
              </TabsList>
              <TabsContent className="space-y-4" value="llm">
                <div className={BUILD_MODE === "export" ? "hidden" : ""}>
                  <FormField
                    control={form.control}
                    name="mode"
                    render={({ field }) => (
                      <FormItem className="from-item">
                        <FormLabel className="col-span-1">
                          {t("setting.mode")}
                        </FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleModeChange(value);
                            }}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-sm:max-h-48">
                              <SelectItem value="local">
                                {t("setting.local")}
                              </SelectItem>
                              <SelectItem value="proxy">
                                {t("setting.proxy")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem className="from-item">
                      <FormLabel className="col-span-1">
                        {t("setting.provider")}
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleProviderChange(value);
                          }}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="google">
                              Google AI Studio
                            </SelectItem>
                            <SelectItem value="openai">
                              OpenAI Compatible
                            </SelectItem>
                            <SelectItem value="openrouter">
                              OpenRouter
                            </SelectItem>
                            <SelectItem value="deepseek">DeepSeek</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div
                  className={cn("space-y-4", {
                    hidden: mode === "proxy",
                  })}
                >
                  <FormField
                    control={form.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem className="from-item">
                        <FormLabel className="col-span-1">
                          {t("setting.apiKeyLabel")}
                          <span className="ml-1 text-red-500">*</span>
                        </FormLabel>
                        <FormControl className="col-span-3">
                          <Password
                            type="text"
                            placeholder={t("setting.apiKeyPlaceholder")}
                            {...field}
                            onBlur={() => handleValueChange()}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apiProxy"
                    render={({ field }) => (
                      <FormItem className="from-item">
                        <FormLabel className="col-span-1">
                          {t("setting.apiUrlLabel")}
                        </FormLabel>
                        <FormControl className="col-span-3">
                          <Input
                            placeholder={baseUrlPlaceholder}
                            {...field}
                            onBlur={() => handleValueChange()}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div
                  className={cn("space-y-4", {
                    hidden: mode === "local" || BUILD_MODE === "export",
                  })}
                >
                  <FormField
                    control={form.control}
                    name="accessPassword"
                    render={({ field }) => (
                      <FormItem className="from-item">
                        <FormLabel className="col-span-1">
                          {t("setting.accessPassword")}
                          <span className="ml-1 text-red-500">*</span>
                        </FormLabel>
                        <FormControl className="col-span-3">
                          <Password
                            type="text"
                            placeholder={t("setting.accessPasswordPlaceholder")}
                            {...field}
                            onBlur={() => handleValueChange()}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="thinkingModel"
                  render={({ field }) => (
                    <FormItem className="from-item">
                      <FormLabel className="col-span-1">
                        {t("setting.thinkingModel")}
                        <span className="ml-1 text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="col-span-3 w-full">
                          <div
                            className={
                              ["google", "openrouter"].includes(provider)
                                ? ""
                                : "hidden"
                            }
                          >
                            <Select
                              defaultValue={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger
                                className={cn({
                                  hidden: modelList.length === 0,
                                })}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-sm:max-h-72">
                                {thinkingModelList[0].length > 0 ? (
                                  <SelectGroup>
                                    <SelectLabel>
                                      {t("setting.recommendedModels")}
                                    </SelectLabel>
                                    {thinkingModelList[0].map((name) => {
                                      return (
                                        <SelectItem key={name} value={name}>
                                          {convertModelName(name)}
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectGroup>
                                ) : null}
                                <SelectGroup>
                                  <SelectLabel>
                                    {t("setting.otherModels")}
                                  </SelectLabel>
                                  {thinkingModelList[1].map((name) => {
                                    return (
                                      <SelectItem key={name} value={name}>
                                        {convertModelName(name)}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            <Button
                              className={cn("w-full", {
                                hidden: modelList.length > 0,
                              })}
                              type="button"
                              variant="outline"
                              onClick={() => fetchModelList()}
                            >
                              <RefreshCw
                                className={isRefreshing ? "animate-spin" : ""}
                              />{" "}
                              {t("setting.refresh")}
                            </Button>
                          </div>
                          <div
                            className={
                              ["google", "openrouter"].includes(provider)
                                ? "hidden"
                                : ""
                            }
                          >
                            <Input placeholder="" {...field} />
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="networkingModel"
                  render={({ field }) => (
                    <FormItem className="from-item">
                      <FormLabel className="col-span-1">
                        {t("setting.networkingModel")}
                        <span className="ml-1 text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="col-span-3 w-full">
                          <div
                            className={
                              ["google", "openrouter"].includes(provider)
                                ? ""
                                : "hidden"
                            }
                          >
                            <Select
                              defaultValue={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger
                                className={cn({
                                  hidden: modelList.length === 0,
                                })}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-sm:max-h-72">
                                {networkingModelList[0].length > 0 ? (
                                  <SelectGroup>
                                    <SelectLabel>
                                      {t("setting.recommendedModels")}
                                    </SelectLabel>
                                    {networkingModelList[0].map((name) => {
                                      return (
                                        <SelectItem key={name} value={name}>
                                          {convertModelName(name)}
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectGroup>
                                ) : null}
                                <SelectGroup>
                                  <SelectLabel>
                                    {t("setting.otherModels")}
                                  </SelectLabel>
                                  {networkingModelList[1].map((name) => {
                                    return (
                                      <SelectItem key={name} value={name}>
                                        {convertModelName(name)}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            <Button
                              className={cn("w-full", {
                                hidden: modelList.length > 0,
                              })}
                              type="button"
                              variant="outline"
                              onClick={() => fetchModelList()}
                            >
                              <RefreshCw
                                className={isRefreshing ? "animate-spin" : ""}
                              />{" "}
                              {t("setting.refresh")}
                            </Button>
                          </div>
                          <div
                            className={
                              ["google", "openrouter"].includes(provider)
                                ? "hidden"
                                : ""
                            }
                          >
                            <Input
                              placeholder="Please enter the model id"
                              {...field}
                            />
                          </div>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
              <TabsContent className="space-y-4" value="search">
                <FormField
                  control={form.control}
                  name="enableSearch"
                  render={({ field }) => (
                    <FormItem className="from-item">
                      <FormLabel className="col-span-1">Web Search</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Enable</SelectItem>
                            <SelectItem value="0">Disable</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="searchProvider"
                  render={({ field }) => (
                    <FormItem className="from-item">
                      <FormLabel className="col-span-1">
                        Search Provider
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleSearchProviderChange(value);
                          }}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="model">Model</SelectItem>
                            <SelectItem value="tavily">Tavily</SelectItem>
                            <SelectItem value="firecrawl">Firecrawl</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="searchApiKey"
                  render={({ field }) => (
                    <FormItem className="from-item">
                      <FormLabel className="col-span-1">
                        {t("setting.apiKeyLabel")}
                        <span className="ml-1 text-red-500">*</span>
                      </FormLabel>
                      <FormControl className="col-span-3">
                        <Password
                          type="text"
                          placeholder="Please enter your Api Key"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="searchApiProxy"
                  render={({ field }) => (
                    <FormItem className="from-item">
                      <FormLabel className="col-span-1">
                        {t("setting.apiUrlLabel")}
                      </FormLabel>
                      <FormControl className="col-span-3">
                        <Input
                          placeholder={searchBaseUrlPlaceholder}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="searchMaxResult"
                  render={({ field }) => (
                    <FormItem className="from-item">
                      <FormLabel className="col-span-1">
                        Search Results
                      </FormLabel>
                      <FormControl className="col-span-3">
                        <Input
                          type="number"
                          max={10}
                          min={1}
                          {...field}
                          {...form.register("searchMaxResult", {
                            setValueAs: (value) => Number(value),
                          })}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
              <TabsContent className="space-y-4" value="general">
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem className="from-item">
                      <FormLabel className="col-span-1">
                        {t("setting.language")}
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en-US">English</SelectItem>
                            <SelectItem value="zh-CN">简体中文</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem className="from-item">
                      <FormLabel className="col-span-1">{t("theme")}</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="system">
                              {t("setting.system")}
                            </SelectItem>
                            <SelectItem value="light">
                              {t("setting.light")}
                            </SelectItem>
                            <SelectItem value="dark">
                              {t("setting.dark")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="from-item">
                  <Label>{t("setting.version")}</Label>
                  <div className="col-span-3 text-center leading-10">
                    {`v${VERSION}`}
                    <small className="ml-1">
                      (
                      <a
                        className="hover:underline hover:underline-offset-4 hover:text-blue-500"
                        href="https://github.com/u14app/deep-research"
                        target="_blank"
                      >
                        {t("setting.checkForUpdate")}
                      </a>
                      )
                    </small>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
        <DialogFooter className="mt-2 flex-row sm:justify-between sm:space-x-0 gap-3">
          <Button className="flex-1" variant="outline" onClick={onClose}>
            {t("setting.cancel")}
          </Button>
          <Button
            className="flex-1"
            type="submit"
            onClick={form.handleSubmit(handleSubmit)}
          >
            {t("setting.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default Setting;
