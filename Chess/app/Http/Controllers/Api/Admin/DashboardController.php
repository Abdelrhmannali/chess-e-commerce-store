<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        // Revenue is collected from delivered orders (or any non-cancelled order
        // that has been marked as paid by admin).
        $totalRevenue = Order::query()
            ->where(function ($q) {
                $q->where('status', 'delivered')
                  ->orWhere('payment_status', 'paid');
            })
            ->where('status', '!=', 'cancelled')
            ->sum('total_price');

        // Pending revenue: orders still in the pipeline (not yet delivered/cancelled).
        $pendingRevenue = Order::query()
            ->whereIn('status', ['pending', 'processing', 'shipped'])
            ->sum('total_price');

        return response()->json([
            'statistics' => [
                'users' => User::where('role', 'user')->count(),
                'categories' => Category::count(),
                'products' => Product::count(),
                'orders' => Order::count(),
                'pending_orders' => Order::where('status', 'pending')->count(),
                'total_revenue' => number_format((float) $totalRevenue, 2, '.', ''),
                'pending_revenue' => number_format((float) $pendingRevenue, 2, '.', ''),
            ],
            'recent_orders' => Order::with(['user', 'items.product'])
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn ($order) => [
                    'id' => $order->id,
                    'user' => $order->user?->name,
                    'total_price' => $order->total_price,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'items_count' => $order->items->count(),
                    'created_at' => $order->created_at,
                ]),
        ]);
    }
}
