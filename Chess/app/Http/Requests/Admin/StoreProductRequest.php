<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug'],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'quantity' => ['required', 'integer', 'min:0'],
            'image' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
            'status' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'image.required' => 'يرجى رفع ملف صورة.',
            'image.image' => 'يجب أن يكون الملف المرفوع صورة صالحة.',
            'image.mimes' => 'يُسمح فقط بصور JPG و JPEG و PNG و WEBP.',
            'image.max' => 'يجب ألا يتجاوز حجم الصورة 2 ميجابايت.',
            'name.required' => 'اسم المنتج مطلوب.',
            'category_id.required' => 'التصنيف مطلوب.',
            'category_id.exists' => 'التصنيف المحدد غير موجود.',
            'description.required' => 'وصف المنتج مطلوب.',
            'price.required' => 'السعر مطلوب.',
            'price.min' => 'يجب أن يكون السعر صفراً أو أكثر.',
            'quantity.required' => 'الكمية مطلوبة.',
            'quantity.min' => 'يجب أن تكون الكمية صفراً أو أكثر.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($this->filled('image') && is_string($this->input('image'))) {
                $validator->errors()->add('image', 'روابط الصور غير مسموحة. يرجى رفع ملف صورة.');
            }
        });
    }
}
