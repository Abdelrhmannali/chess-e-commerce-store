<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $items = $this->whenLoaded('items');

        return [
            'id' => $this->id,
            'items' => CartItemResource::collection($items),
            'total' => $this->when(
                $this->relationLoaded('items'),
                fn () => number_format(
                    $this->items->sum(fn ($item) => $item->price * $item->quantity),
                    2,
                    '.',
                    ''
                )
            ),
        ];
    }
}
