<?php

namespace App\Support;

/**
 * Random codes meant to be read off paper, such as passwords printed on a
 * card: no 0/O or 1/I/L that are easily confused.
 */
final class ReadableCode
{
    private const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

    public static function generate(int $length = 10): string
    {
        $code = '';

        for ($i = 0; $i < $length; $i++) {
            $code .= self::ALPHABET[random_int(0, strlen(self::ALPHABET) - 1)];
        }

        return $code;
    }
}
