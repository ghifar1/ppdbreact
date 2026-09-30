<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class Reorder
{
    /**
     * Move an item one step up or down among its siblings by swapping
     * `sort_order`, renumbering the siblings 1..n first so gaps or
     * duplicate values never get in the way.
     *
     * @param  Collection<int, Model>  $siblings  All items in the same list, in display order.
     */
    public static function move(Collection $siblings, Model $item, string $direction): void
    {
        $items = $siblings->values();
        $index = $items->search(fn (Model $sibling) => $sibling->is($item));
        $target = $direction === 'up' ? $index - 1 : $index + 1;

        if ($index === false || ! $items->has($target)) {
            return;
        }

        [$items[$index], $items[$target]] = [$items[$target], $items[$index]];

        DB::transaction(function () use ($items) {
            foreach ($items as $position => $sibling) {
                if ($sibling->sort_order !== $position + 1) {
                    $sibling->forceFill(['sort_order' => $position + 1])->save();
                }
            }
        });
    }
}
