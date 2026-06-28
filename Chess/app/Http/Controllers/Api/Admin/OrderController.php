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
        $order->update($request->validated());
        $order->load(['user', 'items.product']);

        return response()->json([
            'message' => 'Order updated successfully.',
            'order' => new OrderResource($order),
        ]);
    }

    public function destroy(Order $order): JsonResponse
    {
        if ($order->status !== 'cancelled') {
            return response()->json([
                'message' => 'Only cancelled orders can be deleted.',
            ], 422);
        }

        $order->delete();

        return response()->json(['message' => 'Order deleted successfully.']);
    }
}
