import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from '@/entity/PurchaseOrder';
import { PurchaseDetail } from '@/entity/PurchaseDetail';
import { PurchaseStorage } from '@/entity/PurchaseStorage';
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
} from './dto/purchase-order.dto';
import {
  CreatePurchaseDetailDto,
  UpdatePurchaseDetailDto,
} from './dto/purchase-detail.dto';
import {
  CreatePurchaseStorageDto,
  UpdatePurchaseStorageDto,
} from './dto/purchase-storage.dto';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseDetail)
    private readonly purchaseDetailRepository: Repository<PurchaseDetail>,
    @InjectRepository(PurchaseStorage)
    private readonly purchaseStorageRepository: Repository<PurchaseStorage>,
  ) {}

  // 采购订单 (PurchaseOrder) CRUD
  findAllOrders() {
    return this.purchaseOrderRepository.find({
      relations: ['purchaseDetails', 'purchaseStorages', 'manufacturer'],
    });
  }

  findOneOrder(order_no: string) {
    return this.purchaseOrderRepository.findOne({
      where: { order_no },
      relations: ['purchaseDetails', 'purchaseStorages', 'manufacturer'],
    });
  }

  createOrder(createDto: CreatePurchaseOrderDto) {
    const order = this.purchaseOrderRepository.create(createDto);
    return this.purchaseOrderRepository.save(order);
  }

  async updateOrder(order_no: string, updateDto: UpdatePurchaseOrderDto) {
    await this.purchaseOrderRepository.update(order_no, updateDto);
    return this.findOneOrder(order_no);
  }

  async removeOrder(order_no: string) {
    const order = await this.findOneOrder(order_no);
    if (order) {
      await this.purchaseOrderRepository.remove(order);
      return true;
    }
    return false;
  }

  // 采购明细 (PurchaseDetail) CRUD
  findAllDetails() {
    return this.purchaseDetailRepository.find({
      relations: ['purchaseOrder', 'drug'],
    });
  }

  findOneDetail(id: number) {
    return this.purchaseDetailRepository.findOne({
      where: { id },
      relations: ['purchaseOrder', 'drug'],
    });
  }

  createDetail(createDto: CreatePurchaseDetailDto) {
    const detail = this.purchaseDetailRepository.create(createDto);
    return this.purchaseDetailRepository.save(detail);
  }

  async updateDetail(id: number, updateDto: UpdatePurchaseDetailDto) {
    await this.purchaseDetailRepository.update(id, updateDto);
    return this.findOneDetail(id);
  }

  async removeDetail(id: number) {
    const detail = await this.findOneDetail(id);
    if (detail) {
      await this.purchaseDetailRepository.remove(detail);
      return true;
    }
    return false;
  }

  // 采购入库 (PurchaseStorage) CRUD
  findAllStorages() {
    return this.purchaseStorageRepository.find({
      relations: ['purchaseOrder', 'drug', 'manufacturer'],
    });
  }

  findOneStorage(id: number) {
    return this.purchaseStorageRepository.findOne({
      where: { id },
      relations: ['purchaseOrder', 'drug', 'manufacturer'],
    });
  }

  createStorage(createDto: CreatePurchaseStorageDto) {
    const storage = this.purchaseStorageRepository.create(createDto);
    return this.purchaseStorageRepository.save(storage);
  }

  async updateStorage(id: number, updateDto: UpdatePurchaseStorageDto) {
    await this.purchaseStorageRepository.update(id, updateDto);
    return this.findOneStorage(id);
  }

  async removeStorage(id: number) {
    const storage = await this.findOneStorage(id);
    if (storage) {
      await this.purchaseStorageRepository.remove(storage);
      return true;
    }
    return false;
  }
}
