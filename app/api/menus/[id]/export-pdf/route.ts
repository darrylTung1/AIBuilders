import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { menus, menuItems } from "@/lib/db/schema";
import { uploadPdf } from "@/lib/storage/upload";
import { MenuPdfDocument } from "@/lib/pdf/menu-pdf";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const menuId = Number((await params).id);
  if (Number.isNaN(menuId))
    return NextResponse.json({ error: "Invalid menu id" }, { status: 400 });

  const [menu] = await db.select().from(menus).where(eq(menus.id, menuId));
  if (!menu) return NextResponse.json({ error: "Menu not found" }, { status: 404 });

  // Parse request body for template options
  let template: "modern" | "classic" | "elegant" | "rustic" = "modern";
  let colorScheme = undefined;
  let categoryOrder = undefined;

  try {
    const body = await request.json();
    if (body.template) template = body.template;
    if (body.design?.colorScheme) colorScheme = body.design.colorScheme;
    if (body.design?.layout?.categoryOrder) categoryOrder = body.design.layout.categoryOrder;
  } catch {
    // Use defaults
  }

  const items = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.menuId, menuId))
    .orderBy(menuItems.sortOrder);

  const { renderToBuffer } = await import("@react-pdf/renderer");
  const React = await import("react");
  
  let buffer: Buffer;
  try {
    const docElement = React.createElement(MenuPdfDocument, {
      menuName: menu.name,
      template,
      colorScheme,
      categoryOrder,
      items: items.map((i) => ({
        name: i.name,
        description: i.description,
        price: String(i.price),
        category: i.category,
        imageUrl: i.imageUrl,
        isRecommended: i.isRecommended ?? false,
        fontSizeTier: i.fontSizeTier,
      })),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    buffer = await renderToBuffer(docElement as any);
  } catch (e) {
    console.error("PDF render error:", e);
    return NextResponse.json(
      { error: "Failed to generate PDF. Please ensure all menu items have valid data." },
      { status: 500 }
    );
  }

  const filename = `menu-${menuId}-${template}-${Date.now()}.pdf`;
  let url: string;
  try {
    url = await uploadPdf(buffer, filename);
  } catch (e) {
    console.error("PDF upload error:", e);
    return NextResponse.json(
      { error: "PDF generated but save failed. Ensure public/uploads is writable." },
      { status: 500 }
    );
  }

  await db.update(menus).set({ pdfUrl: url }).where(eq(menus.id, menuId));

  return NextResponse.json({ url, pdfUrl: url });
}
