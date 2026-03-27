<?php
/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 */
declare(strict_types=1);

namespace Magento\Framework\GraphQl\Query;

use GraphQL\Language\AST\DocumentNode;
use GraphQL\Language\Parser;
use GraphQL\Language\Source;
use Magento\Framework\App\State\ReloadProcessorInterface;
use Magento\Framework\GraphQl\Exception\GraphQlInputException;

/**
 * Wrapper for GraphQl query parser. It parses query string into a `GraphQL\Language\AST\DocumentNode`
 */
class QueryParser implements ReloadProcessorInterface
{
    private const DEFAULT_MAX_NESTING_DEPTH = 200;

    /**
     * @var DocumentNode[]
     */
    private array $parsedQueries = [];

    /**
     * @param int $maxNestingDepth
     */
    public function __construct(
        private readonly int $maxNestingDepth = self::DEFAULT_MAX_NESTING_DEPTH
    ) {
    }

    /**
     * Parse query string into a `GraphQL\Language\AST\DocumentNode`.
     *
     * @param string $query
     * @return DocumentNode
     * @throws GraphQlInputException
     * @throws \GraphQL\Error\SyntaxError
     */
    public function parse(string $query): DocumentNode
    {
        $cacheKey = sha1($query);
        if (!isset($this->parsedQueries[$cacheKey])) {
            $this->validateNestingDepth($query);
            $this->parsedQueries[$cacheKey] = Parser::parse(new Source($query, 'GraphQL'));
        }
        return $this->parsedQueries[$cacheKey];
    }

    /**
     * Validates that the query does not exceed the maximum allowed nesting depth.
     *
     * This check runs before the recursive parser to prevent stack overflow from
     * deeply nested inline fragments or selection sets.
     *
     * @param string $query
     * @throws GraphQlInputException
     */
    private function validateNestingDepth(string $query): void
    {
        $depth = 0;
        $maxDepth = 0;
        $len = strlen($query);
        $inString = false;
        $escaped = false;

        for ($i = 0; $i < $len; $i++) {
            $char = $query[$i];

            if ($escaped) {
                $escaped = false;
                continue;
            }

            if ($char === '\\' && $inString) {
                $escaped = true;
                continue;
            }

            if ($char === '"') {
                $inString = !$inString;
                continue;
            }

            if ($inString) {
                continue;
            }

            if ($char === '{' || $char === '[') {
                $depth++;
                if ($depth > $maxDepth) {
                    $maxDepth = $depth;
                }
            } elseif ($char === '}' || $char === ']') {
                $depth--;
            }

            if ($maxDepth > $this->maxNestingDepth) {
                throw new GraphQlInputException(
                    __('Query is too deep. Reduce the nesting level of your query.')
                );
            }
        }
    }

    /**
     * @inheritDoc
     */
    public function reloadState(): void
    {
        $this->parsedQueries = [];
    }
}
