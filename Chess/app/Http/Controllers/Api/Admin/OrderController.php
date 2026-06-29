<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $orders = Order::with(['user', 'items.product'])
            ->when($request->status, fn ($query) => $query->where('status', $request->status))
            ->when($request->payment_status, fn ($query) => $query->where('payment_status', $request->payment_status))
            ->latest()
            ->paginate(15);

        return OrderResource::collection($orders);
    }

    public function show(Order $order): OrderResource
    {
        $order->load(['user', 'items.product']);

        return new OrderResource($order);
    }

    public function update(UpdateOrderRequest $request, Order $order): JsonResponse
    {
        $data = $request->validated();

        // Auto-mark payment as paid when order reaches delivered status
        if (($data['status'] ?? null) === 'delivered' && empty($data['payment_status'])) {
            $data['payment_status'] = 'paid';
        }

        // Reset payment to pending if order is cancelled
        if (($data['status'] ?? null) === 'cancelled' && empty($data['payment_status'])) {
            $data['payment_status'] = 'pending';
        }

        $order->update($data);
        $order->load(['user', 'items.product']);

        return response()->json([
            'message' => 'تم تحديث الطلب بنجاح.',
            'order' => new OrderResource($order),
        ]);
    }

    public function destroy(Order $order): JsonResponse
    {
        if ($order->status !== 'cancelled') {
            return response()->json([
                'message' => 'يمكن حذف الطلبات الملغاة فقط.',
            ], 422);
        }

        $order->delete();

        return response()->json(['message' => 'تم حذف الطلب بنجاح.']);
    }
}
