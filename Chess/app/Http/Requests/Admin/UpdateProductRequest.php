<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['sometimes', 'exists:categories,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($this->route('product'))],
            'description' => ['sometimes', 'string'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'quantity' => ['sometimes', 'integer', 'min:0'],
            'image' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'boolean'],
        ];
    }
}
