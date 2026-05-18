import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useAlertConfirm } from "../context/AlertConfirmContext";
import { API_URL } from "../env";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  Loader2,
  Phone,
  ShoppingCart,
  CheckSquare,
  Clipboard,
  Search,
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description: string;
  longDescription: string;
  contents: string;
  materials: string;
  price: number;
  category: string;
  images: string[];
  minAgeMonths: number;
  maxAgeMonths: number;
  stock: number;
  videoUrl?: string;
}

interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  _id: string;
}

interface Order {
  _id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  items: OrderItem[];
  totalAmount: number;
  status: "Initiated" | "Confirmed" | "Dispatched" | "Received" | "Returned";
  createdAt: string;
  updatedAt: string;
}

const AdminDashboard: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useAlertConfirm();

  const handleLogoutClick = async () => {
    const confirmed = await showConfirm(
      "Sign Out",
      "Are you sure you want to log out of the admin panel?",
    );
    if (confirmed) {
      logout();
    }
  };

  // Tab control state
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");

  // Product states
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(
    null,
  );
  const [selectedFilesList, setSelectedFilesList] = useState<File[]>([]);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Order states
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");

  // Dynamically filter orders based on query parameters (order ID, name, email, location, phone number)
  const filteredOrders = orders.filter((order) => {
    const query = orderSearchQuery.trim().toLowerCase();
    if (!query) return true;

    return (
      order._id.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.email.toLowerCase().includes(query) ||
      order.phone.toLowerCase().includes(query) ||
      `${order.address} ${order.city} ${order.state} ${order.zipCode}`.toLowerCase().includes(query)
    );
  });

  const categories = ["Velcro Binders", "Flashcards", "Activity Books"];

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    if (activeTab === "products") {
      fetchProducts();
    } else {
      fetchOrders();
    }
  }, [token, navigate, activeTab]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching products", error);
      if ((error as any).response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await api.get("/orders");
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching orders", error);
      if ((error as any).response?.status === 401) {
        logout();
      }
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm(
      "Delete Product",
      "Are you sure you want to delete this product? This action cannot be undone.",
    );
    if (confirmed) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product", error);
        await showAlert("Error", "Failed to delete product.");
      }
    }
  };

  const handleDeleteOrder = async (id: string) => {
    const confirmed = await showConfirm(
      "Delete Order",
      "Are you sure you want to delete this order? This action cannot be undone.",
    );
    if (confirmed) {
      try {
        await api.delete(`/orders/${id}`);
        fetchOrders();
      } catch (error) {
        console.error("Error deleting order", error);
        await showAlert("Error", "Failed to delete order.");
      }
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setCurrentProduct(product);
    } else {
      setCurrentProduct({
        name: "",
        description: "",
        longDescription: "",
        contents: "",
        materials: "",
        price: 0,
        stock: 0,
        category: categories[0],
        minAgeMonths: 0,
        maxAgeMonths: 84,
        videoUrl: "",
      });
    }
    setSelectedFilesList([]);
    setSelectedVideoFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
    setSelectedFilesList([]);
    setSelectedVideoFile(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    // Validate number fields
    const priceVal = Number(currentProduct.price);
    const stockVal = Number(currentProduct.stock);
    const minAgeVal = Number(currentProduct.minAgeMonths);
    const maxAgeVal = Number(currentProduct.maxAgeMonths);

    if (
      String(currentProduct.price).trim() === "" ||
      isNaN(priceVal) ||
      priceVal <= 0
    ) {
      await showAlert(
        "Validation Error",
        "Please enter a valid price greater than 0",
      );
      return;
    }
    if (
      String(currentProduct.stock).trim() === "" ||
      isNaN(stockVal) ||
      !Number.isInteger(stockVal) ||
      stockVal < 0
    ) {
      await showAlert(
        "Validation Error",
        "Please enter a valid non-negative whole number for stock",
      );
      return;
    }
    if (
      String(currentProduct.minAgeMonths).trim() === "" ||
      isNaN(minAgeVal) ||
      !Number.isInteger(minAgeVal) ||
      minAgeVal < 0 ||
      minAgeVal > 84
    ) {
      await showAlert(
        "Validation Error",
        "Min Age must be a whole number between 0 and 84 months",
      );
      return;
    }
    if (
      String(currentProduct.maxAgeMonths).trim() === "" ||
      isNaN(maxAgeVal) ||
      !Number.isInteger(maxAgeVal) ||
      maxAgeVal < 0 ||
      maxAgeVal > 84
    ) {
      await showAlert(
        "Validation Error",
        "Max Age must be a whole number between 0 and 84 months",
      );
      return;
    }
    if (minAgeVal > maxAgeVal) {
      await showAlert(
        "Validation Error",
        "Min Age cannot be greater than Max Age",
      );
      return;
    }

    setSaving(true);
    const formData = new FormData();

    Object.keys(currentProduct).forEach((key) => {
      if (key !== "images" && key !== "_id") {
        formData.append(key, String((currentProduct as any)[key]));
      }
    });

    if (currentProduct._id && currentProduct.images) {
      currentProduct.images.forEach((img) => {
        formData.append("existingImages", img);
      });
    }

    if (selectedFilesList && selectedFilesList.length > 0) {
      selectedFilesList.forEach((file) => {
        formData.append("images", file);
      });
    }

    if (selectedVideoFile) {
      formData.append("video", selectedVideoFile);
    }

    try {
      if (currentProduct._id) {
        await api.put(`/products/${currentProduct._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      handleCloseModal();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product", error);
      await showAlert("Error", "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: Order["status"],
  ) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await api.put(`/orders/${orderId}/status`, {
        status: newStatus,
      });
      if (res.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to update status", error);
      await showAlert("Error", "Failed to update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusBadgeStyle = (status: Order["status"]) => {
    switch (status) {
      case "Initiated":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Confirmed":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Dispatched":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Received":
        return "bg-green-50 text-green-700 border-green-200";
      case "Returned":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-3xl font-brand font-black text-gray-900 tracking-tight">
              Admin Portal
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Manage shop collections and process client orders
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {activeTab === "products" && (
              <button
                onClick={() => handleOpenModal()}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-sm transition-colors text-sm"
              >
                <Plus size={18} className="mr-2" /> Add Product
              </button>
            )}
            <button
              onClick={handleLogoutClick}
              className="text-gray-500 hover:text-red-600 border border-gray-300 bg-white hover:bg-red-50 px-5 py-2.5 rounded-xl font-bold transition-all text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex space-x-6 mb-8 border-b border-gray-100">
          <button
            onClick={() => setActiveTab("products")}
            className={`pb-4 text-base font-extrabold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === "products"
                ? "border-primary text-primary-dark"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <CheckSquare size={18} />
            <span>Products Inventory</span>
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-4 text-base font-extrabold border-b-2 transition-all flex items-center space-x-2 relative ${
              activeTab === "orders"
                ? "border-primary text-primary-dark"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <ShoppingCart size={18} />
            <span>Customer Orders</span>
            {orders.filter((o) => o.status === "Initiated").length > 0 && (
              <span className="absolute -top-1 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {orders.filter((o) => o.status === "Initiated").length}
              </span>
            )}
          </button>
        </div>

        {/* 1. Products Tab Panel */}
        {activeTab === "products" && (
          <>
            {loading ? (
              <div className="flex justify-center p-20">
                <Loader2 className="animate-spin text-primary" size={48} />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Age Range
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr
                          key={product._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                {product.images && product.images.length > 0 ? (
                                  <img
                                    className="h-12 w-12 object-cover"
                                    src={product.images[0].startsWith('http') ? product.images[0] : `${API_URL}${product.images[0]}`}
                                    alt=""
                                  />
                                ) : (
                                  <ImageIcon className="text-gray-400" />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-bold text-gray-900">
                                  {product.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            ₹{product.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {product.stock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.minAgeMonths}m - {product.maxAgeMonths}m
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleOpenModal(product)}
                              className="text-primary hover:text-primary-dark mr-4 transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* 2. Customer Orders Tab Panel */}
        {activeTab === "orders" && (
          <>
            {ordersLoading ? (
              <div className="flex justify-center p-20">
                <Loader2 className="animate-spin text-primary" size={48} />
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <Clipboard
                  className="mx-auto text-gray-300 mb-4 animate-pulse"
                  size={48}
                />
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  No Orders Found
                </h3>
                <p className="text-gray-500 font-medium">
                  Customer orders will appear here once initiated on checkout.
                </p>
              </div>
            ) : (
              <>
                {/* Search Bar & Order Counter Panel */}
                <div className="mb-6 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative flex-grow max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Search size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by ID, Name, Email, Location or Phone..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow text-sm"
                    />
                    {orderSearchQuery && (
                      <button
                        onClick={() => setOrderSearchQuery("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        aria-label="Clear Search"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="text-sm font-semibold text-gray-500 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100/50 self-start md:self-auto">
                    Showing <span className="text-primary-dark font-black">{filteredOrders.length}</span> of <span className="text-gray-700 font-bold">{orders.length}</span> orders
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Search
                      className="mx-auto text-gray-300 mb-4 animate-pulse"
                      size={48}
                    />
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      No Matching Orders
                    </h3>
                    <p className="text-gray-500 font-medium mb-6">
                      We couldn't find any orders matching "{orderSearchQuery}".
                    </p>
                    <button
                      onClick={() => setOrderSearchQuery("")}
                      className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark font-bold transition-all active:scale-95 shadow-sm"
                    >
                      Clear Search Filter
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                              Order ID & Date
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                              Customer Details
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                              Items Ordered
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                              Status Badge
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                              State Controls
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredOrders.map((order) => (
                        <tr
                          key={order._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {/* Order ID & Date */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="font-mono text-xs font-bold text-gray-700 block select-all">
                              {order._id}
                            </span>
                            <span className="text-xs font-semibold text-gray-400 block mt-1">
                              {new Date(order.createdAt).toLocaleString(
                                undefined,
                                {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                },
                              )}
                            </span>
                          </td>

                          {/* Customer Contact Details */}
                          <td className="px-6 py-4 max-w-xs">
                            <div className="text-sm font-bold text-gray-900">
                              {order.customerName}
                            </div>
                            <div className="text-xs font-semibold text-gray-500 mt-0.5 break-words">
                              {order.email}
                            </div>
                            <div className="text-xs font-medium text-gray-400 mt-1 leading-relaxed">
                              {order.address}, {order.city}, {order.state} -{" "}
                              {order.zipCode}
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <a
                                href={`https://wa.me/${order.phone.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 text-xs text-[#25D366] hover:text-[#20ba59] font-bold"
                              >
                                <Phone size={12} />
                                <span>{order.phone}</span>
                              </a>
                            </div>
                          </td>

                          {/* Items Ordered List */}
                          <td className="px-6 py-4">
                            <ul className="space-y-1">
                              {order.items.map((item, idx) => (
                                <li
                                  key={idx}
                                  className="text-xs text-gray-700 font-medium"
                                >
                                  <span className="font-bold text-gray-900">
                                    {item.name}
                                  </span>
                                  <span className="text-gray-400 ml-1">
                                    (x{item.quantity})
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </td>

                          {/* Total Bill */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-primary-dark">
                            ₹{order.totalAmount}
                          </td>

                          {/* Dynamic Status Badge */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-extrabold rounded-full border ${getStatusBadgeStyle(order.status)}`}
                            >
                              {order.status}
                            </span>
                          </td>

                          {/* Order State Controllers */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex items-center justify-end space-x-2">
                              {updatingOrderId === order._id ? (
                                <Loader2
                                  className="animate-spin text-primary"
                                  size={16}
                                />
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <select
                                    value={order.status}
                                    onChange={(e) =>
                                      handleUpdateOrderStatus(
                                        order._id,
                                        e.target.value as Order["status"],
                                      )
                                    }
                                    className="border border-gray-300 rounded-xl px-3 py-1.5 font-bold text-xs focus:ring-1 focus:ring-primary focus:border-primary bg-white outline-none cursor-pointer text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <option value="Initiated">Initiated</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Dispatched">Dispatched</option>
                                    <option value="Received">Received</option>
                                    <option value="Returned">Returned</option>
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOrder(order._id)}
                                    className="bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 p-2 rounded-xl border border-red-100 transition-colors flex items-center justify-center shadow-sm"
                                    title="Delete Order"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
                )}
              </>
            )}
          </>
        )}

        {/* Add/Edit Modal (Inventory Tab Only) */}
        {isModalOpen && currentProduct && (
          <div className="fixed inset-0 bg-gray-900/50 flex justify-center items-center p-4 z-[60] overflow-y-auto backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto my-8 p-8 relative shadow-2xl">
              <button
                onClick={handleCloseModal}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 transition-colors bg-gray-100 p-2 rounded-full z-10"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-8">
                {currentProduct._id ? "Edit Product" : "Add New Product"}
              </h2>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      required
                      value={currentProduct.name}
                      onChange={(e) =>
                        setCurrentProduct({
                          ...currentProduct,
                          name: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={currentProduct.category}
                      onChange={(e) =>
                        setCurrentProduct({
                          ...currentProduct,
                          category: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="text"
                      required
                      value={currentProduct.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*\.?\d*$/.test(val)) {
                          setCurrentProduct({
                            ...currentProduct,
                            price: val as any,
                          });
                        }
                      }}
                      placeholder="e.g. 499"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Stock
                    </label>
                    <input
                      type="text"
                      required
                      value={currentProduct.stock}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*$/.test(val)) {
                          setCurrentProduct({
                            ...currentProduct,
                            stock: val as any,
                          });
                        }
                      }}
                      placeholder="e.g. 15"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Min Age (Months)
                    </label>
                    <input
                      type="text"
                      required
                      value={currentProduct.minAgeMonths}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*$/.test(val)) {
                          setCurrentProduct({
                            ...currentProduct,
                            minAgeMonths: val as any,
                          });
                        }
                      }}
                      placeholder="e.g. 0"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Max Age (Months)
                    </label>
                    <input
                      type="text"
                      required
                      value={currentProduct.maxAgeMonths}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*$/.test(val)) {
                          setCurrentProduct({
                            ...currentProduct,
                            maxAgeMonths: val as any,
                          });
                        }
                      }}
                      placeholder="e.g. 36"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Short Description
                  </label>
                  <textarea
                    required
                    value={currentProduct.description}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        description: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow h-20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Long Description (Details Tab)
                  </label>
                  <textarea
                    required
                    value={currentProduct.longDescription}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        longDescription: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow h-32"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Contents (What's Inside Tab)
                  </label>
                  <textarea
                    required
                    value={currentProduct.contents}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        contents: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow h-24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Materials (Safety & Materials Tab)
                  </label>
                  <textarea
                    required
                    value={currentProduct.materials}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        materials: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow h-24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Instagram Reel Video URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={currentProduct.videoUrl && currentProduct.videoUrl.startsWith('http') ? currentProduct.videoUrl : ''}
                    onChange={(e) =>
                      setCurrentProduct({
                        ...currentProduct,
                        videoUrl: e.target.value,
                      })
                    }
                    placeholder="e.g. https://www.instagram.com/reel/C8a1b2c3d4e/"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
                  />
                </div>

                <div className="text-center py-1 text-xs font-black text-gray-400 tracking-wider">
                  — OR —
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Upload Local Video File (Optional - MP4/MOV)
                  </label>
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime,video/x-m4v"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setSelectedVideoFile(e.target.files[0]);
                        setCurrentProduct(prev => prev ? { ...prev, videoUrl: '' } : null);
                      }
                    }}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                  />
                  {selectedVideoFile && (
                    <p className="mt-2 text-sm text-green-600 font-semibold flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                      Selected Video: {selectedVideoFile.name} ({(selectedVideoFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                  )}
                  {currentProduct.videoUrl && !selectedVideoFile && !currentProduct.videoUrl.startsWith('http') && (
                    <p className="mt-2 text-sm text-primary font-bold">Currently has a locally uploaded video asset: {currentProduct.videoUrl.split('/').pop()}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Product Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const newFiles = Array.from(e.target.files);
                        setSelectedFilesList((prev) => [...prev, ...newFiles]);
                        e.target.value = ""; // Clear file input value to allow re-selection
                      }
                    }}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                  />

                  {/* Existing Product Images (If Editing) */}
                  {currentProduct && currentProduct.images && currentProduct.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Existing Images</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {currentProduct.images.map((imgUrl, idx) => (
                          <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-50 flex items-center justify-center">
                            <img
                              src={imgUrl.startsWith('http') ? imgUrl : `${API_URL}${imgUrl}`}
                              alt={`Existing ${idx}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentProduct(prev => prev ? {
                                  ...prev,
                                  images: (prev.images || []).filter((_, i) => i !== idx)
                                } : null);
                              }}
                              className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow transition-colors"
                              title="Delete Image"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Newly Selected Product Images */}
                  {selectedFilesList.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">New Images to Upload</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {selectedFilesList.map((file, idx) => {
                          const previewUrl = URL.createObjectURL(file);
                          return (
                            <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-50 flex items-center justify-center">
                              <img
                                src={previewUrl}
                                alt={`Selected ${idx}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedFilesList((prev) => prev.filter((_, i) => i !== idx));
                                }}
                                className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow transition-colors"
                                title="Remove Image"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark font-bold shadow-sm hover:shadow transition-all disabled:opacity-70 flex items-center"
                  >
                    {saving && (
                      <Loader2 className="animate-spin mr-2" size={18} />
                    )}
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
