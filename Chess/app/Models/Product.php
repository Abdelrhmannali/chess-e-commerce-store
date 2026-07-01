<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'discount_price',
        'quantity',
        'image',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'discount_price' => 'decimal:2',
            'status' => 'boolean',
        ];
    }

    /**
     * The price actually charged to customers.
     * Returns the discount price when it's set and lower than the regular price;
     * otherwise falls back to the regular price.
     */
    public function getEffectivePriceAttribute(): float
    {
        $discount = $this->discount_price !== null ? (float) $this->discount_price : null;
        $price = (float) $this->price;
        if ($discount !== null && $discount > 0 && $discount < $price) {
            return $discount;
        }
        return $price;
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
