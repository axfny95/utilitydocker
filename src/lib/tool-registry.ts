import { lazy, type ComponentType } from 'react';

type LazyComponent = React.LazyExoticComponent<ComponentType<{ toolSlug: string }>>;

const registry: Record<string, () => Promise<{ default: ComponentType<any> }>> = {
  // Developer Tools
  JsonFormatter: () => import('../components/tools/JsonFormatter'),
  Base64Encoder: () => import('../components/tools/Base64Encoder'),
  MarkdownEditor: () => import('../components/tools/MarkdownEditor'),
  UrlEncoder: () => import('../components/tools/UrlEncoder'),
  HashGenerator: () => import('../components/tools/HashGenerator'),
  CssGradientGenerator: () => import('../components/tools/CssGradientGenerator'),
  RegexTester: () => import('../components/tools/RegexTester'),
  UuidGenerator: () => import('../components/tools/UuidGenerator'),
  UnixTimestampConverter: () => import('../components/tools/UnixTimestampConverter'),
  JwtDecoder: () => import('../components/tools/JwtDecoder'),
  CronExpressionGenerator: () => import('../components/tools/CronExpressionGenerator'),
  ColorPicker: () => import('../components/tools/ColorPicker'),
  NumberBaseConverter: () => import('../components/tools/NumberBaseConverter'),
  IpLookup: () => import('../components/tools/IpLookup'),
  HtmlEntityEncoder: () => import('../components/tools/HtmlEntityEncoder'),
  SqlFormatter: () => import('../components/tools/SqlFormatter'),
  BoxShadowGenerator: () => import('../components/tools/BoxShadowGenerator'),
  CodeMinifier: () => import('../components/tools/CodeMinifier'),
  ChmodCalculator: () => import('../components/tools/ChmodCalculator'),
  // Text Tools
  WordCounter: () => import('../components/tools/WordCounter'),
  CaseConverter: () => import('../components/tools/CaseConverter'),
  TextDiff: () => import('../components/tools/TextDiff'),
  FancyTextGenerator: () => import('../components/tools/FancyTextGenerator'),
  RemoveLineBreaks: () => import('../components/tools/RemoveLineBreaks'),
  LoremIpsumGenerator: () => import('../components/tools/LoremIpsumGenerator'),
  // Image Tools
  ImageCompressor: () => import('../components/tools/ImageCompressor'),
  ImageResizer: () => import('../components/tools/ImageResizer'),
  ImageFormatConverter: () => import('../components/tools/ImageFormatConverter'),
  ExifViewer: () => import('../components/tools/ExifViewer'),
  FaviconGenerator: () => import('../components/tools/FaviconGenerator'),
  WatermarkAdder: () => import('../components/tools/WatermarkAdder'),
  // Generator Tools
  QrCodeGenerator: () => import('../components/tools/QrCodeGenerator'),
  PrivacyPolicyGenerator: () => import('../components/tools/PrivacyPolicyGenerator'),
  ColorPaletteGenerator: () => import('../components/tools/ColorPaletteGenerator'),
  // SEO Tools
  MetaTagGenerator: () => import('../components/tools/MetaTagGenerator'),
  RobotsTxtGenerator: () => import('../components/tools/RobotsTxtGenerator'),
  // PDF Tools
  PdfMerger: () => import('../components/tools/PdfMerger'),
  PdfSplitter: () => import('../components/tools/PdfSplitter'),
  InvoiceGenerator: () => import('../components/tools/InvoiceGenerator'),
  JpgToPdfConverter: () => import('../components/tools/JpgToPdfConverter'),
  // Legal Tools
  TermsOfServiceGenerator: () => import('../components/tools/TermsOfServiceGenerator'),
  CookiePolicyGenerator: () => import('../components/tools/CookiePolicyGenerator'),
  // Calculator Tools
  PercentageCalculator: () => import('../components/tools/PercentageCalculator'),
  AgeCalculator: () => import('../components/tools/AgeCalculator'),
  BmiCalculator: () => import('../components/tools/BmiCalculator'),
  TipCalculator: () => import('../components/tools/TipCalculator'),
  MortgageCalculator: () => import('../components/tools/MortgageCalculator'),
  AspectRatioCalculator: () => import('../components/tools/AspectRatioCalculator'),
  // Converter Tools
  UnitConverter: () => import('../components/tools/UnitConverter'),
  JsonCsvConverter: () => import('../components/tools/JsonCsvConverter'),
  // Productivity Tools
  EmojiPicker: () => import('../components/tools/EmojiPicker'),
  PomodoroTimer: () => import('../components/tools/PomodoroTimer'),
  RandomNumberGenerator: () => import('../components/tools/RandomNumberGenerator'),
  CountdownTimer: () => import('../components/tools/CountdownTimer'),
  WorldClock: () => import('../components/tools/WorldClock'),
  // Media Tools
  VideoToMp3: () => import('../components/tools/VideoToMp3'),
  VideoToGif: () => import('../components/tools/VideoToGif'),
  VideoCompressor: () => import('../components/tools/VideoCompressor'),
  YoutubeThumbnailDownloader: () => import('../components/tools/YoutubeThumbnailDownloader'),
};

export function getToolComponent(name: string): LazyComponent {
  const loader = registry[name];
  if (!loader) throw new Error(`Tool component "${name}" not found in registry`);
  return lazy(loader);
}

export function hasToolComponent(name: string): boolean {
  return name in registry;
}
