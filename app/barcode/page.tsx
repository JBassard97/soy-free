"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type Product = {
  allergens?: string;
  ingredients_text?: string;
  [key: string]: unknown;
};

export default function SoyChecker() {
  const [barcode, setBarcode] = useState<string>("");
  const [product, setProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState<string | null>(null);
  const [brandName, setBrandName] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState<string>("white");

  const productContainsSoy = (product: Product): boolean => {
    const allergens = product.allergens?.toLowerCase() || "";
    const ingredients = product.ingredients_text?.toLowerCase() || "";
    return allergens.includes("soybeans") || ingredients.includes("soy");
  };

  const fetchProductByBarcode = async (
    barcode: string
  ): Promise<Product | null> => {
    if (!barcode) return null;
    try {
      const res = await fetch(
        `https://world.openfoodfacts.net/api/v2/product/${barcode}`
      );
      if (!res.ok) return null;

      const data = await res.json();
      return data?.product || null;
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedBarcode = barcode.trim();
    if (!trimmedBarcode) return;

    const fetchedProduct = await fetchProductByBarcode(trimmedBarcode);
    if (!fetchedProduct) {
      setResultMessage("❌ Product not found.");
      setBgColor("#ffe0e0");
      setProduct(null);
      setProductName(null);
      setBrandName(null);
      return;
    }

    setProductName(
      typeof fetchedProduct.product_name === "string"
        ? fetchedProduct.product_name
        : "Unknown Product"
    );

    setBrandName(
      typeof fetchedProduct.brands === "string"
        ? fetchedProduct.brands
        : "Unknown Brand"
    );

    const containsSoy = productContainsSoy(fetchedProduct);
    setResultMessage(containsSoy ? "🚫 DON'T EAT THIS." : "✅ YOU'RE GOOD.");
    setBgColor(containsSoy ? "pink" : "lightgreen");
    setProduct(fetchedProduct);
  };

  const handleClear = () => {
    setBarcode("");
    setProduct(null);
    setProductName(null);
    setBrandName(null);
    setResultMessage(null);
    setBgColor("white");
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBarcode(e.target.value);
  };

  return (
    <div
      className="min-h-screen p-6 transition-colors"
      style={{ backgroundColor: bgColor }}
    >
      <Card className="max-w-xl mx-auto">
        <CardContent className="space-y-2 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">Enter the UPC Barcode</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="barcode"
                  type="text"
                  value={barcode}
                  onChange={handleInputChange}
                  placeholder="e.g. 041390001019"
                />
                <Button
                  className="cursor-pointer"
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                >
                  🧹
                </Button>
              </div>
            </div>

            <Button className="cursor-pointer" type="submit">
              Check For Soy
            </Button>
          </form>

          {productName && <p className="italic">&rdquo;{productName}&rdquo;</p>}
          {brandName && (
            <p className="text-sm text-muted-foreground">Brand: {brandName}</p>
          )}

          {resultMessage && (
            <p className="font-semibold text-lg">{resultMessage}</p>
          )}

          {product && (
            <ScrollArea className="h-72 w-full border rounded-md p-2 bg-gray-50">
              <div className="w-[1200px]">
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {JSON.stringify(product, null, 2)}
                </pre>
              </div>
              <ScrollBar orientation="horizontal" />
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
