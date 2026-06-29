<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $products = Product::with('category')
            ->where('status', true)
            ->when($request->category_id, fn ($query) => $query->where('category_id', $request->category_id))
            ->when($request->search, fn ($query, $search) => $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            }))
            ->when($request->min_price, fn ($query) => $query->where('price', '>=', $request->min_price))
            ->when($request->max_price, fn ($query) => $query->where('price', '<=', $request->max_price))
            ->latest()
            ->paginate($request->integer('per_page', 12));

        return ProductResource::collection($products);
    }

    public function show(Product $product): ProductResource|JsonResponse
    {
        if (! $product->status) {
            return response()->json(['message' => 'المنتج غير موجود.'], 404);
        }

        $product->load('category');

        return new ProductResource($product);
    }
}
