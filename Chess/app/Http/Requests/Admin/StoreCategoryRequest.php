<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:categories,slug'],
            'image' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
            'description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'image.required' => 'يرجى رفع ملف صورة.',
            'image.image' => 'يجب أن يكون الملف المرفوع صورة صالحة.',
            'image.mimes' => 'يُسمح فقط بصور JPG و JPEG و PNG و WEBP.',
            'image.max' => 'يجب ألا يتجاوز حجم الصورة 2 ميجابايت.',
            'name.required' => 'اسم التصنيف مطلوب.',
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
