import { NextResponse } from "next/server";
import { getReporteData } from "@/lib/queries";
import { buildXlsx } from "@/lib/xlsx-builder";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await getReporteData();
    const buffer = await buildXlsx(data);
    const filename = `UINL-Bolivia-2026-${new Date().toISOString().slice(0, 10)}.xlsx`;
    // Cast a BlobPart — TS distingue Uint8Array<ArrayBufferLike> vs <ArrayBuffer>,
    // pero a runtime es el mismo Uint8Array y la API lo acepta.
    const blob = new Blob([buffer as unknown as BlobPart], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return new NextResponse(`Error generando Excel: ${e.message ?? e}`, { status: 500 });
  }
}
