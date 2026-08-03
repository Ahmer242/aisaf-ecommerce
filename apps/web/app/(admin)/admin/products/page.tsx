"use client";

import React, { useState } from "react";
import Link from "next/link";

interface ProductRow {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  isActive: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([
    { id: "p1", name: "Rose Hydration Serum", category: "Skincare", price: 2450, stock: 18, isActive: true },
    { id: "p2", name: "Velvet Matte Lipstick", category: "Makeup", price: 1250, stock: 2, isActive: true },
    { id: "p3", name: "Gentle Foaming Cleanser", category: "Skincare", price: 1800, stock: 4, isActive: true },
    { id: "p4", name: "Nourishing Hair Treatment Oil", category: "Haircare", price: 3100, stock: 0, isActive: false },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", category: "Skincare", price: "", stock: "" });

  const toggleActive = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    const created: ProductRow = {
      id: `p_${Date.now()}`,
      name: newProduct.name,
      category: newProduct.category,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock) || 0,
      isActive: true,
    };

    setProducts([created, ...products]);
    setNewProduct({ name: "", category: "Skincare", price: "", stock: "" });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[var(--color-text-primary)]">Products Catalog</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Manage store inventory, prices, and catalog status.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[var(--color-accent-dark)] hover:bg-[var(--color-accent)] text-white text-sm font-medium px-5 py-2.5 rounded-[var(--radius-md)] transition-colors self-start sm:self-auto"
        >
          + Add New Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-primary-light)]/50 border-b border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] uppercase">
              <tr>
                <th className="px-6 py-3.5 font-medium">Product Name</th>
                <th className="px-6 py-3.5 font-medium">Category</th>
                <th className="px-6 py-3.5 font-medium">Price</th>
                <th className="px-6 py-3.5 font-medium">Stock</th>
                <th className="px-6 py-3.5 font-medium">Status</th>
                <th className="px-6 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {products.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--color-primary-light)]/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-[var(--color-text-primary)]">{item.name}</td>
                  <td className="px-6 py-4 text-[var(--color-text-secondary)]">{item.category}</td>
                  <td className="px-6 py-4 font-semibold text-[var(--color-accent-dark)]">Rs. {item.price.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={item.stock <= 5 ? "text-[var(--color-error)] font-bold" : "text-[var(--color-text-primary)]"}>
                      {item.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        item.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.isActive ? "Active" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleActive(item.id)}
                      className="text-xs text-[var(--color-accent-dark)] hover:underline font-medium"
                    >
                      {item.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 max-w-md w-full shadow-[var(--shadow-lg)] space-y-4">
            <h2 className="text-xl font-serif font-bold text-[var(--color-text-primary)]">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] p-2.5 focus:outline-none focus:border-[var(--color-accent)]"
                  placeholder="e.g. Botanical Facial Oil"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] p-2.5 focus:outline-none focus:border-[var(--color-accent)]"
                >
                  <option value="Skincare">Skincare</option>
                  <option value="Makeup">Makeup</option>
                  <option value="Haircare">Haircare</option>
                  <option value="Fragrance">Fragrance</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Price (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] p-2.5 focus:outline-none focus:border-[var(--color-accent)]"
                    placeholder="2500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] p-2.5 focus:outline-none focus:border-[var(--color-accent)]"
                    placeholder="25"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[var(--color-accent-dark)] text-white px-4 py-2 rounded-[var(--radius-sm)] text-xs font-medium hover:bg-[var(--color-accent)] transition-colors"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
