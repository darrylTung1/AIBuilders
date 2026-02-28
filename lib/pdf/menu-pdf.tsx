import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

type MenuItem = {
  name: string;
  description: string | null;
  price: string;
  category: string | null;
  imageUrl: string | null;
  isRecommended: boolean;
  fontSizeTier: string | null;
};

type ColorScheme = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
};

type Props = {
  menuName: string;
  items: MenuItem[];
  template?: "modern" | "classic" | "elegant" | "rustic";
  colorScheme?: ColorScheme;
  categoryOrder?: string[];
};

const defaultColors: ColorScheme = {
  primary: "#102A43",
  secondary: "#486581",
  accent: "#F59E0B",
  background: "#FFFFFF",
  text: "#1E293B",
};

function groupByCategory(items: MenuItem[], order?: string[]) {
  const byCategory = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.category?.trim() || "Menu";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  if (order && order.length > 0) {
    const ordered: Record<string, MenuItem[]> = {};
    for (const cat of order) {
      if (byCategory[cat]) ordered[cat] = byCategory[cat];
    }
    for (const cat of Object.keys(byCategory)) {
      if (!ordered[cat]) ordered[cat] = byCategory[cat];
    }
    return ordered;
  }
  return byCategory;
}

// Modern Template
function ModernPdf({ menuName, items, colorScheme = defaultColors, categoryOrder }: Props) {
  const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: "Helvetica", backgroundColor: colorScheme.background },
    header: { borderBottomWidth: 2, borderBottomColor: colorScheme.primary, paddingBottom: 12, marginBottom: 24 },
    title: { fontSize: 22, color: colorScheme.primary, fontWeight: "bold" },
    category: { fontSize: 10, color: colorScheme.accent, textTransform: "uppercase", letterSpacing: 1, marginTop: 16, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: colorScheme.accent, paddingBottom: 4 },
    itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, paddingVertical: 4 },
    itemName: { fontSize: 12, color: colorScheme.primary, fontWeight: "bold", maxWidth: "75%" },
    itemNameHigh: { fontSize: 14, color: colorScheme.primary, fontWeight: "bold", maxWidth: "75%" },
    itemPrice: { fontSize: 12, color: colorScheme.primary, fontWeight: "bold" },
    itemDesc: { fontSize: 9, color: colorScheme.secondary, marginBottom: 6, maxWidth: "85%" },
    badge: { fontSize: 7, backgroundColor: colorScheme.accent, color: "#fff", padding: "2 4", marginLeft: 4 },
  });

  const byCategory = groupByCategory(items, categoryOrder);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{menuName}</Text>
        </View>
        {Object.entries(byCategory).map(([category, catItems]) => (
          <View key={category}>
            <Text style={styles.category}>{category}</Text>
            {catItems.map((item, i) => (
              <View key={i} wrap={false}>
                <View style={styles.itemRow}>
                  <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    <Text style={item.fontSizeTier === "high" ? styles.itemNameHigh : styles.itemName}>
                      {item.name}
                    </Text>
                    {item.isRecommended && <Text style={styles.badge}>Popular</Text>}
                  </View>
                  <Text style={styles.itemPrice}>${Number(item.price).toFixed(2)}</Text>
                </View>
                {item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

// Classic Template
function ClassicPdf({ menuName, items, colorScheme, categoryOrder }: Props) {
  const colors = colorScheme || { primary: "#8B4513", secondary: "#D2691E", accent: "#228B22", background: "#FFF8DC", text: "#2F1810" };
  const styles = StyleSheet.create({
    page: { padding: 50, fontFamily: "Times-Roman", backgroundColor: colors.background },
    header: { textAlign: "center", marginBottom: 30, borderBottomWidth: 1, borderBottomColor: colors.primary, paddingBottom: 16 },
    title: { fontSize: 28, color: colors.primary, fontFamily: "Times-Bold" },
    divider: { width: 60, height: 2, backgroundColor: colors.accent, marginTop: 10, marginLeft: "auto", marginRight: "auto" },
    category: { fontSize: 14, color: colors.secondary, textTransform: "uppercase", letterSpacing: 2, textAlign: "center", marginTop: 20, marginBottom: 12 },
    itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4, alignItems: "flex-start" },
    itemName: { fontSize: 12, color: colors.primary, fontFamily: "Times-Bold", maxWidth: "70%" },
    itemNameHigh: { fontSize: 14, color: colors.primary, fontFamily: "Times-Bold", maxWidth: "70%" },
    itemPrice: { fontSize: 12, color: colors.secondary, fontFamily: "Times-Bold" },
    itemDesc: { fontSize: 10, color: colors.text, fontFamily: "Times-Italic", marginBottom: 10 },
    badge: { fontSize: 7, backgroundColor: colors.accent, color: "#fff", padding: "2 6", marginLeft: 6 },
  });

  const byCategory = groupByCategory(items, categoryOrder);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{menuName}</Text>
          <View style={styles.divider} />
        </View>
        {Object.entries(byCategory).map(([category, catItems]) => (
          <View key={category}>
            <Text style={styles.category}>~ {category} ~</Text>
            {catItems.map((item, i) => (
              <View key={i} wrap={false}>
                <View style={styles.itemRow}>
                  <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    <Text style={item.fontSizeTier === "high" ? styles.itemNameHigh : styles.itemName}>
                      {item.name}
                    </Text>
                    {item.isRecommended && <Text style={styles.badge}>Chef&apos;s Pick</Text>}
                  </View>
                  <Text style={styles.itemPrice}>${Number(item.price).toFixed(2)}</Text>
                </View>
                {item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

// Elegant Template
function ElegantPdf({ menuName, items, colorScheme, categoryOrder }: Props) {
  const colors = colorScheme || { primary: "#1C1C1C", secondary: "#C9A227", accent: "#8B0000", background: "#FFFEF7", text: "#1C1C1C" };
  const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: "Times-Roman", backgroundColor: colors.background },
    border: { borderWidth: 2, borderColor: colors.secondary, padding: 30 },
    header: { textAlign: "center", marginBottom: 30 },
    subtitle: { fontSize: 8, color: colors.secondary, textTransform: "uppercase", letterSpacing: 3, marginBottom: 6 },
    title: { fontSize: 32, color: colors.primary, fontFamily: "Times-Roman", letterSpacing: 2 },
    dividerContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 12 },
    dividerLine: { width: 40, height: 1, backgroundColor: colors.secondary },
    dividerDot: { width: 6, height: 6, backgroundColor: colors.secondary, marginHorizontal: 8, transform: "rotate(45deg)" },
    category: { fontSize: 10, color: colors.secondary, textTransform: "uppercase", letterSpacing: 3, textAlign: "center", marginTop: 24, marginBottom: 16 },
    itemContainer: { textAlign: "center", marginBottom: 14 },
    itemName: { fontSize: 12, color: colors.primary, fontFamily: "Times-Roman", letterSpacing: 1 },
    itemNameHigh: { fontSize: 14, color: colors.primary, fontFamily: "Times-Bold", letterSpacing: 1 },
    itemDesc: { fontSize: 9, color: colors.text, fontFamily: "Times-Italic", marginTop: 2 },
    itemPrice: { fontSize: 10, color: colors.secondary, marginTop: 4 },
    star: { fontSize: 10, color: colors.secondary },
  });

  const byCategory = groupByCategory(items, categoryOrder);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.border}>
          <View style={styles.header}>
            <Text style={styles.subtitle}>Fine Dining</Text>
            <Text style={styles.title}>{menuName}</Text>
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerDot} />
              <View style={styles.dividerLine} />
            </View>
          </View>
          {Object.entries(byCategory).map(([category, catItems]) => (
            <View key={category}>
              <Text style={styles.category}>— {category} —</Text>
              {catItems.map((item, i) => (
                <View key={i} style={styles.itemContainer} wrap={false}>
                  <Text style={item.fontSizeTier === "high" ? styles.itemNameHigh : styles.itemName}>
                    {item.name} {item.isRecommended && <Text style={styles.star}>★</Text>}
                  </Text>
                  {item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
                  <Text style={styles.itemPrice}>${Number(item.price).toFixed(2)}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

// Rustic Template
function RusticPdf({ menuName, items, colorScheme, categoryOrder }: Props) {
  const colors = colorScheme || { primary: "#5D4037", secondary: "#BF360C", accent: "#FFC107", background: "#EFEBE9", text: "#3E2723" };
  const styles = StyleSheet.create({
    page: { padding: 0, fontFamily: "Helvetica-Bold", backgroundColor: colors.background },
    header: { backgroundColor: colors.primary, padding: 24, textAlign: "center" },
    title: { fontSize: 26, color: "#fff", textTransform: "uppercase", letterSpacing: 3 },
    accentBar: { height: 6, backgroundColor: colors.accent },
    content: { padding: 30 },
    categoryContainer: { marginBottom: 20 },
    categoryHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    categoryLine: { flex: 1, height: 2, backgroundColor: colors.secondary },
    category: { fontSize: 12, color: colors.secondary, textTransform: "uppercase", letterSpacing: 2, marginHorizontal: 10 },
    itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6, padding: 8, backgroundColor: "#fff" },
    itemName: { fontSize: 11, color: colors.primary, textTransform: "uppercase", maxWidth: "65%" },
    itemNameHigh: { fontSize: 13, color: colors.primary, textTransform: "uppercase", fontFamily: "Helvetica-Bold", maxWidth: "65%" },
    itemPrice: { fontSize: 14, color: colors.secondary, fontFamily: "Helvetica-Bold" },
    itemDesc: { fontSize: 9, color: colors.text, paddingHorizontal: 8, marginBottom: 8 },
    badge: { fontSize: 7, backgroundColor: colors.accent, color: colors.primary, padding: "2 4", marginLeft: 4 },
  });

  const byCategory = groupByCategory(items, categoryOrder);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{menuName}</Text>
        </View>
        <View style={styles.accentBar} />
        <View style={styles.content}>
          {Object.entries(byCategory).map(([category, catItems]) => (
            <View key={category} style={styles.categoryContainer}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryLine} />
                <Text style={styles.category}>{category}</Text>
                <View style={styles.categoryLine} />
              </View>
              {catItems.map((item, i) => (
                <View key={i} wrap={false}>
                  <View style={styles.itemRow}>
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                      <Text style={item.fontSizeTier === "high" ? styles.itemNameHigh : styles.itemName}>
                        {item.name}
                      </Text>
                      {item.isRecommended && <Text style={styles.badge}>Favorite</Text>}
                    </View>
                    <Text style={styles.itemPrice}>${Number(item.price).toFixed(2)}</Text>
                  </View>
                  {item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
                </View>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

export function MenuPdfDocument({ menuName, items, template = "modern", colorScheme, categoryOrder }: Props) {
  switch (template) {
    case "classic":
      return <ClassicPdf menuName={menuName} items={items} colorScheme={colorScheme} categoryOrder={categoryOrder} />;
    case "elegant":
      return <ElegantPdf menuName={menuName} items={items} colorScheme={colorScheme} categoryOrder={categoryOrder} />;
    case "rustic":
      return <RusticPdf menuName={menuName} items={items} colorScheme={colorScheme} categoryOrder={categoryOrder} />;
    default:
      return <ModernPdf menuName={menuName} items={items} colorScheme={colorScheme} categoryOrder={categoryOrder} />;
  }
}
