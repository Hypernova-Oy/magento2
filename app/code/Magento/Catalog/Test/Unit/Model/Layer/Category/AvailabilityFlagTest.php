<?php
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

namespace Magento\Catalog\Test\Unit\Model\Layer\Category;

use \Magento\Catalog\Model\Layer\Category\AvailabilityFlag;

class AvailabilityFlagTest extends \PHPUnit\Framework\TestCase
{
    /**
     * @var array
     */
    protected $filters;

    /**
     * @var \PHPUnit\Framework\MockObject\MockObject
     */
    protected $filterMock;

    /**
     * @var \PHPUnit\Framework\MockObject\MockObject
     */
    protected $layerMock;

    /**
     * @var \PHPUnit\Framework\MockObject\MockObject
     */
    protected $stateMock;

    /**
     * @var \Magento\Catalog\Model\Layer\Category\AvailabilityFlag
     */
    protected $model;

    protected function setUp(): void
    {
        $this->filterMock = $this->createMock(\Magento\Catalog\Model\Layer\Filter\AbstractFilter::class);
        $this->filters = [$this->filterMock];
        $this->layerMock = $this->createMock(\Magento\Catalog\Model\Layer::class);
        $this->stateMock = $this->createMock(\Magento\Catalog\Model\Layer\State::class);
        $this->model = new AvailabilityFlag();
    }

    /**
     * @param int $itemsCount
     * @param array $filters
     * @param bool $expectedResult
     *
     * @dataProvider isEnabledDataProvider
     * @covers \Magento\Catalog\Model\Layer\Category\AvailabilityFlag::isEnabled
     * @covers \Magento\Catalog\Model\Layer\Category\AvailabilityFlag::canShowOptions
     */
    public function testIsEnabled($itemsCount, $filters, $expectedResult)
    {
        $this->layerMock->expects($this->any())->method('getState')->willReturn($this->stateMock);
        $this->stateMock->expects($this->any())->method('getFilters')->willReturn($filters);
        $this->filterMock->expects($this->once())->method('getItemsCount')->willReturn($itemsCount);

        $this->assertEquals($expectedResult, $this->model->isEnabled($this->layerMock, $this->filters));
    }

    /**
     * @return array
     */
    public function isEnabledDataProvider()
    {
        return [
            [
                'itemsCount' => 0,
                'filters' => [],
                'expectedResult' => false,
            ],
            [
                'itemsCount' => 0,
                'filters' => ['filter'],
                'expectedResult' => true,
            ],
            [
                'itemsCount' => 1,
                'filters' => 0,
                'expectedResult' => true,
            ],
            [
                'itemsCount' => 1,
                'filters' => ['filter'],
                'expectedResult' => true,
            ]
        ];
    }
}
