<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $products = Product::with('category')
            ->when($request->category_id, fn ($query) => $query->where('category_id', $request->category_id))
            ->when($request->search, fn ($query, $search) => $query->where('name', 'like', "%{$search}%"))
            ->when($request->has('status'), fn ($query) => $query->where('status', $request->boolean('status')))
            ->latest()
            ->paginate(15);

        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = Product::create([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => $request->slug ?? Str::slug($request->name),
            'description' => $request->description,
            'price' => $request->price,
            'quantity' => $request->quantity,
            'image' => $request->image,
            'status' => $request->boolean('status', true),
        ]);

        $product->load('category');

        return response()->json([
            'message' => 'Product created successfully.',
            'product' => new ProductResource($product),
        ], 201);
    }

    public function show(Product $product): ProductResource
    {
        $product->load('category');

        return new ProductResource($product);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $data = $request->validated();

        if (isset($data['name']) && ! isset($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        if ($request->has('status')) {
            $data['status'] = $request->boolean('status');
        }

        $product->update($data);
        $product->load('category');

        return response()->json([
            'message' => 'Product updated successfully.',
            'product' => new ProductResource($product),
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully.']);
    }
}
