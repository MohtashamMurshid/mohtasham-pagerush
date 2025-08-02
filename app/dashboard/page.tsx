"use client";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DocumentUpload } from "@/components/DocumentUpload";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Multi-document text extractor dashboard

function UnauthenticatedRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to signin if not authenticated
    router.push("/signin");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to sign in...</p>
      </div>
    </div>
  );
}

function LoadingDashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  );
}

function DashboardMain() {
  const [extractedTexts, setExtractedTexts] = useState<
    Array<{ text: string; fileName: string; extractedAt: Date }>
  >([]);
  const [currentText, setCurrentText] = useState<string>("");
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const { toast } = useToast();

  const handleTextExtracted = (text: string, filename: string) => {
    const newExtraction = {
      text,
      fileName: filename,
      extractedAt: new Date(),
    };

    setExtractedTexts((prev) => [...prev, newExtraction]);
    setCurrentText(text);
    setCurrentFileName(filename);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentText);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy text to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadAsText = () => {
    const blob = new Blob([currentText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentFileName.replace(/\.[^/.]+$/, "")}_extracted.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllAsText = () => {
    const allText = extractedTexts
      .map(
        (item) =>
          `=== ${item.fileName} (${item.extractedAt.toLocaleString()}) ===\n\n${item.text}\n\n`
      )
      .join("\n");

    const blob = new Blob([allText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `all_extracted_texts_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Text Extractor</h1>
        <p className="text-muted-foreground">
          Extract text content from multiple documents for further processing.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <DocumentUpload onTextExtracted={handleTextExtracted} />

        {currentText && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Latest: {currentFileName}
              </h2>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">
                  {currentText.length} characters
                </div>
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button onClick={downloadAsText} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <textarea
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              className="w-full min-h-[300px] p-4 border rounded-lg font-mono text-sm resize-y"
              placeholder="Extracted text will appear here..."
            />
          </div>
        )}

        {extractedTexts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Processed Documents ({extractedTexts.length})
              </h3>
              <Button onClick={downloadAllAsText} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </div>
            <div className="grid gap-3 max-h-64 overflow-y-auto">
              {[...extractedTexts].reverse().map((item, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setCurrentText(item.text);
                    setCurrentFileName(item.fileName);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{item.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.extractedAt.toLocaleTimeString()}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.text.length} characters • Click to view
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">PageRush Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
            <DashboardMain />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function Page() {
  return (
    <>
      <AuthLoading>
        <LoadingDashboard />
      </AuthLoading>
      <Unauthenticated>
        <UnauthenticatedRedirect />
      </Unauthenticated>
      <Authenticated>
        <DashboardLayout />
      </Authenticated>
    </>
  );
}
