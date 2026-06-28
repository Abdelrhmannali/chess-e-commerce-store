<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $categories = Category::withCount('products')
            ->latest()
            ->paginate(15);

        return CategoryResource::collection($categories);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = Category::create([
            'name' => $request->name,
            'slug' => $request->slug ?? Str::slug($request->name),
            'image' => $request->image,
            'description' => $request->description,
        ]);

        return response()->json([
            'message' => 'Category created successfully.',
            'category' => new CategoryResource($category),
        ], 201);
    }

    public function show(Category $category): CategoryResource
    {
        $category->loadCount('products');

        return new CategoryResource($category);
    }

    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $data = $request->validated();

        if (isset($data['name']) && ! isset($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);

        return response()->json([
            'message' => 'Category updated successfully.',
            'category' => new CategoryResource($category),
        ]);
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully.']);
    }
}
