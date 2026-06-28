<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['sometimes', Rule::in(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])],
            'payment_status' => ['sometimes', Rule::in(['pending', 'paid'])],
        ];
    }
}
