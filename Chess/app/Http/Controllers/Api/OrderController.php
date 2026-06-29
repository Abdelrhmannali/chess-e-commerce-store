<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Cart;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $orders = $request->user()
            ->orders()
            ->with(['items.product'])
            ->latest()
            ->paginate(10);

        return OrderResource::collection($orders);
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $user = $request->user();

        $cart = Cart::with(['items.product'])
            ->where('user_id', $user->id)
            ->first();

        if (! $cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'سلة التسوق فارغة.'], 422);
        }

        foreach ($cart->items as $item) {
            if (! $item->product || ! $item->product->status) {
                return response()->json([
                    'message' => "المنتج \"{$item->product?->name}\" لم يعد متاحاً.",
                ], 422);
            }

            if ($item->product->quantity < $item->quantity) {
                return response()->json([
                    'message' => "الكمية المتوفرة من \"{$item->product->name}\" غير كافية.",
                ], 422);
            }
        }

        $order = DB::transaction(function () use ($user, $cart, $request) {
            $totalPrice = $cart->items->sum(fn ($item) => $item->price * $item->quantity);

            $order = Order::create([
                'user_id' => $user->id,
                'total_price' => $totalPrice,
                'status' => 'pending',
                'payment_method' => $request->payment_method,
                'payment_status' => 'pending',
                'shipping_address' => $request->shipping_address,
                'phone' => $request->phone,
            ]);

            foreach ($cart->items as $item) {
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                ]);

                $item->product->decrement('quantity', $item->quantity);
            }

            $cart->items()->delete();

            return $order;
        });

        $order->load(['items.product']);

        return response()->json([
            'message' => 'تم تقديم الطلب بنجاح.',
            'order' => new OrderResource($order),
        ], 201);
    }

    public function show(Request $request, Order $order): OrderResource|JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'الطلب غير موجود.'], 404);
        }

        $order->load(['items.product']);

        return new OrderResource($order);
    }
}
