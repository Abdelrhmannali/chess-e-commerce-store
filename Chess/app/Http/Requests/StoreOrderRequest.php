<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_method' => ['required', Rule::in([
                'cash',
                'visa',
                'mastercard',
                'mada',
                'apple_pay',
                'stc_pay',
                'google_pay',
                'samsung_pay',
                'tamara',
                'tabby',
            ])],
            'shipping_address' => ['required', 'string'],
            'phone' => ['required', 'string', 'max:20'],
        ];
    }
}
