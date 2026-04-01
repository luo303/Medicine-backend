import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesOrder } from '@/entity/SalesOrder';
import { SalesDetail } from '@/entity/SalesDetail';
import { SalesOutbound } from '@/entity/SalesOutbound';
import {
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
} from './dto/sales-order.dto';
import {
  CreateSalesDetailDto,
  UpdateSalesDetailDto,
} from './dto/sales-detail.dto';
import {
  CreateSalesOutboundDto,
  UpdateSalesOutboundDto,
} from './dto/sales-outbound.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(SalesOrder)
    private readonly salesOrderRepository: Repository<SalesOrder>,
    @InjectRepository(SalesDetail)
    private readonly salesDetailRepository: Repository<SalesDetail>,
    @InjectRepository(SalesOutbound)
    private readonly salesOutboundRepository: Repository<SalesOutbound>,
  ) {}

  // 销售订单 CRUD
  findAllOrders() {
    return this.salesOrderRepository.find({
      relations: ['institution', 'salesDetails'],
    });
  }

  findOneOrder(order_no: string) {
    return this.salesOrderRepository.findOne({
      where: { order_no },
      relations: ['institution', 'salesDetails', 'salesDetails.drug'],
    });
  }

  createOrder(createDto: CreateSalesOrderDto) {
    const order = this.salesOrderRepository.create(createDto);
    return this.salesOrderRepository.save(order);
  }

  async updateOrder(order_no: string, updateDto: UpdateSalesOrderDto) {
    await this.salesOrderRepository.update(order_no, updateDto);
    return this.findOneOrder(order_no);
  }

  async removeOrder(order_no: string) {
    const order = await this.findOneOrder(order_no);
    if (order) {
      await this.salesOrderRepository.remove(order);
      return true;
    }
    return false;
  }

  // 销售明细 CRUD
  findAllDetails() {
    return this.salesDetailRepository.find({
      relations: ['salesOrder', 'drug'],
    });
  }

  findOneDetail(id: number) {
    return this.salesDetailRepository.findOne({
      where: { id },
      relations: ['salesOrder', 'drug'],
    });
  }

  createDetail(createDto: CreateSalesDetailDto) {
    const detail = this.salesDetailRepository.create(createDto);
    return this.salesDetailRepository.save(detail);
  }

  async updateDetail(id: number, updateDto: UpdateSalesDetailDto) {
    await this.salesDetailRepository.update(id, updateDto);
    return this.findOneDetail(id);
  }

  async removeDetail(id: number) {
    const detail = await this.findOneDetail(id);
    if (detail) {
      await this.salesDetailRepository.remove(detail);
      return true;
    }
    return false;
  }

  // 销售出库 CRUD
  findAllOutbounds() {
    return this.salesOutboundRepository.find({
      relations: ['salesOrder', 'institution', 'drug'],
    });
  }

  findOneOutbound(id: number) {
    return this.salesOutboundRepository.findOne({
      where: { id },
      relations: ['salesOrder', 'institution', 'drug'],
    });
  }

  createOutbound(createDto: CreateSalesOutboundDto) {
    const outbound = this.salesOutboundRepository.create(createDto);
    return this.salesOutboundRepository.save(outbound);
  }

  async updateOutbound(id: number, updateDto: UpdateSalesOutboundDto) {
    await this.salesOutboundRepository.update(id, updateDto);
    return this.findOneOutbound(id);
  }

  async removeOutbound(id: number) {
    const outbound = await this.findOneOutbound(id);
    if (outbound) {
      await this.salesOutboundRepository.remove(outbound);
      return true;
    }
    return false;
  }
}
