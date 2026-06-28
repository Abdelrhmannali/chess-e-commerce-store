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
        $totalRevenue = Order::where('payment_status', 'paid')->sum('total_price');

        return response()->json([
            'statistics' => [
                'users' => User::where('role', 'user')->count(),
                'categories' => Category::count(),
                'products' => Product::count(),
                'orders' => Order::count(),
                'pending_orders' => Order::where('status', 'pending')->count(),
                'total_revenue' => number_format((float) $totalRevenue, 2, '.', ''),
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
