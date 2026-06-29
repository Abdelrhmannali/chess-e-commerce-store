<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Support\ImageUploadHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);

        $categories = Category::withCount('products')
            ->latest()
            ->paginate($perPage);

        return CategoryResource::collection($categories);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $imagePath = ImageUploadHelper::store($request->file('image'), 'categories');

        $category = Category::create([
            'name' => $request->name,
            'slug' => $request->slug ?? Str::slug($request->name),
            'image' => $imagePath,
            'description' => $request->description,
        ]);

        return response()->json([
            'message' => 'تم إنشاء التصنيف بنجاح.',
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

        if ($request->hasFile('image')) {
            ImageUploadHelper::delete($category->image);
            $data['image'] = ImageUploadHelper::store($request->file('image'), 'categories');
        } else {
            unset($data['image']);
        }

        $category->update($data);

        return response()->json([
            'message' => 'تم تحديث التصنيف بنجاح.',
            'category' => new CategoryResource($category),
        ]);
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->load('products');

        foreach ($category->products as $product) {
            ImageUploadHelper::delete($product->image);
        }

        ImageUploadHelper::delete($category->image);
        $category->delete();

        return response()->json(['message' => 'تم حذف التصنيف بنجاح.']);
    }
}
