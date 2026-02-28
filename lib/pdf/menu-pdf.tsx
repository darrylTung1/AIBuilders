import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica" },
  title: { fontSize: 24, marginBottom: 20, fontWeight: "bold" },
  category: { fontSize: 12, marginTop: 16, marginBottom: 8, color: "#666", textTransform: "uppercase" },
  itemRow: { flexDirection: "row", marginBottom: 10, alignItems: "flex-start" },
  itemName: { fontSize: 14, fontWeight: "bold", flex: 1 },
  itemNameHigh: { fontSize: 18, fontWeight: "bold", flex: 1 },
  itemPrice: { fontSize: 14, marginLeft: 8 },
  itemDesc: { fontSize: 10, color: "#444", marginTop: 2, marginLeft: 0 },
  badge: { fontSize: 8, backgroundColor: "#d97706", color: "white", padding: "2 6", marginLeft: 6 },
});

type MenuItem = {
  name: string;
  description: string | null;
  price: string;
  category: string | null;
  imageUrl: string | null;
  isRecommended: boolean;
  fontSizeTier: string | null;
};

type Props = { menuName: string; items: MenuItem[] };

export function MenuPdfDocument({ menuName, items }: Props) {
  const byCategory = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.category?.trim() || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{menuName}</Text>
        {Object.entries(byCategory).map(([category, catItems]) => (
          <View key={category}>
            <Text style={styles.category}>{category}</Text>
            {catItems.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                  <Text style={item.fontSizeTier === "high" ? styles.itemNameHigh : styles.itemName}>
                    {item.name}
                  </Text>
                  {item.isRecommended && (
                    <Text style={styles.badge}> Recommended</Text>
                  )}
                </View>
                <Text style={styles.itemPrice}>${Number(item.price).toFixed(2)}</Text>
              </View>
            ))}
            {catItems.map(
              (item, i) =>
                item.description && (
                  <Text key={`desc-${i}`} style={styles.itemDesc}>
                    {item.description}
                  </Text>
                )
            )}
          </View>
        ))}
      </Page>
    </Document>
  );
}
