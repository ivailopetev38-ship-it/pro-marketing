import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { Antoan09PresentationDocument } from "@/lib/pdf/antoan09-presentation-document";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const stream = await renderToStream(<Antoan09PresentationDocument />);
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
      "Content-Disposition": 'inline; filename="Antoan09-Oferta-ProMarketing.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
