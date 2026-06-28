<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $catalog = [
            'boards' => [
                ['name' => 'Royal Marble Chess Board with Golden Veins', 'price' => 249.99, 'quantity' => 3, 'image' => 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80'],
                ['name' => 'Grandmaster Walnut & Maple Tournament Chess Board', 'price' => 149.99, 'quantity' => 12, 'image' => 'https://images.unsplash.com/photo-1586165368502-1badb97a6461?auto=format&fit=crop&w=800&q=80'],
                ['name' => 'Minimalist Black Leather Roll-up Chess Board', 'price' => 89.99, 'quantity' => 20, 'image' => 'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?auto=format&fit=crop&w=800&q=80'],
            ],
            'pieces' => [
                ['name' => 'Heavy Brass & Charcoal Chrome Championship Pieces', 'price' => 320, 'quantity' => 3, 'image' => 'https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?auto=format&fit=crop&w=800&q=80'],
                ['name' => 'Staunton Boxwood & Gabon Ebony Pieces', 'price' => 189.99, 'quantity' => 8, 'image' => 'https://images.unsplash.com/photo-1604948501466-4e9c3e24955a?auto=format&fit=crop&w=800&q=80'],
                ['name' => 'Artisan Imperial Gold-Accented Porcelain Pieces', 'price' => 450, 'quantity' => 2, 'image' => 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=800&q=80'],
            ],
            'clocks' => [
                ['name' => 'Retro Mechanical Brass Game Clock', 'price' => 110, 'quantity' => 6, 'image' => 'https://images.unsplash.com/photo-1544085311-11a028465b03?auto=format&fit=crop&w=800&q=80'],
                ['name' => 'Tempus Wood-Framed Digital Tournament Clock', 'price' => 125, 'quantity' => 15, 'image' => 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80'],
            ],
            'accessories' => [
                ['name' => 'Royal Leather Double Chess Set Carrier Bag', 'price' => 95, 'quantity' => 10, 'image' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'],
                ['name' => 'Grandmaster Knight Badge Gold Suit Pin', 'price' => 25, 'quantity' => 50, 'image' => 'https://images.unsplash.com/photo-1595909393164-190b79e2a4a7?auto=format&fit=crop&w=800&q=80'],
                ['name' => 'Artisan Beeswax & Microfiber Polish Care Kit', 'price' => 19.99, 'quantity' => 40, 'image' => 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=800&q=80'],
            ],
        ];

        foreach ($catalog as $slug => $products) {
            $category = Category::firstOrCreate(
                ['slug' => $slug],
                [
                    'name' => ucfirst($slug),
                    'description' => 'Premium chess ' . $slug,
                ]
            );

            foreach ($products as $item) {
                Product::firstOrCreate(
                    ['slug' => Str::slug($item['name'])],
                    [
                        'category_id' => $category->id,
                        'name' => $item['name'],
                        'description' => 'Handcrafted premium chess equipment.',
                        'price' => $item['price'],
                        'quantity' => $item['quantity'],
                        'image' => $item['image'],
                        'status' => true,
                    ]
                );
            }
        }
    }
}
