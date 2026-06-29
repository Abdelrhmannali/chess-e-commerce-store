<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddCartItemRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function show(Request $request): CartResource
    {
        $cart = $this->getOrCreateCart($request->user()->id);
        $cart->load(['items.product.category']);

        return new CartResource($cart);
    }

    public function addItem(AddCartItemRequest $request): JsonResponse
    {
        $product = Product::where('id', $request->product_id)
            ->where('status', true)
            ->firstOrFail();

        if ($product->quantity < $request->quantity) {
            return response()->json([
                'message' => 'الكمية المتوفرة من هذا المنتج غير كافية.',
            ], 422);
        }

        $cart = $this->getOrCreateCart($request->user()->id);

        $cartItem = $cart->items()->where('product_id', $product->id)->first();

        if ($cartItem) {
            $newQuantity = $cartItem->quantity + $request->quantity;

            if ($product->quantity < $newQuantity) {
                return response()->json([
                    'message' => 'الكمية المتوفرة من هذا المنتج غير كافية.',
                ], 422);
            }

            $cartItem->update([
                'quantity' => $newQuantity,
                'price' => $product->price,
            ]);
        } else {
            $cartItem = $cart->items()->create([
                'product_id' => $product->id,
                'quantity' => $request->quantity,
                'price' => $product->price,
            ]);
        }

        $cart->load(['items.product.category']);

        return response()->json([
            'message' => 'تمت إضافة المنتج إلى السلة.',
            'cart' => new CartResource($cart),
        ]);
    }

    public function updateItem(UpdateCartItemRequest $request, CartItem $cartItem): JsonResponse
    {
        $cart = $this->getOrCreateCart($request->user()->id);

        if ($cartItem->cart_id !== $cart->id) {
            return response()->json(['message' => 'عنصر السلة غير موجود.'], 404);
        }

        $product = $cartItem->product;

        if ($product->quantity < $request->quantity) {
            return response()->json([
                'message' => 'الكمية المتوفرة من هذا المنتج غير كافية.',
            ], 422);
        }

        $cartItem->update([
            'quantity' => $request->quantity,
            'price' => $product->price,
        ]);

        $cart->load(['items.product.category']);

        return response()->json([
            'message' => 'تم تحديث عنصر السلة.',
            'cart' => new CartResource($cart),
        ]);
    }

    public function removeItem(Request $request, CartItem $cartItem): JsonResponse
    {
        $cart = $this->getOrCreateCart($request->user()->id);

        if ($cartItem->cart_id !== $cart->id) {
            return response()->json(['message' => 'عنصر السلة غير موجود.'], 404);
        }

        $cartItem->delete();
        $cart->load(['items.product.category']);

        return response()->json([
            'message' => 'تمت إزالة العنصر من السلة.',
            'cart' => new CartResource($cart),
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request->user()->id);
        $cart->items()->delete();
        $cart->load(['items.product.category']);

        return response()->json([
            'message' => 'تم تفريغ السلة.',
            'cart' => new CartResource($cart),
        ]);
    }

    private function getOrCreateCart(int $userId): Cart
    {
        return Cart::firstOrCreate(['user_id' => $userId]);
    }
}
