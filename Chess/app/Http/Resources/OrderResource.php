<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'total_price' => $this->total_price,
            'status' => $this->status,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'shipping_address' => $this->shipping_address,
            'phone' => $this->phone,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
