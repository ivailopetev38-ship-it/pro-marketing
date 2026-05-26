import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { TeodorPresentationDocument } from "@/lib/pdf/teodor-presentation-document";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const stream = await renderToStream(<TeodorPresentationDocument />);
  const webStream = new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on("data", (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
      stream.on("end", () => controller.close());
      stream.on("error", (err: Error) => controller.error(err));
    },
  });
  return new NextResponse(webStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="Teodor-Lozev-Prezentaciya-ProMarketing.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
