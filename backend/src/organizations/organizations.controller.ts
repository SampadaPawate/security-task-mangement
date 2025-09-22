import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/rbac.service';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.CREATE_ORGANIZATION)
  create(@Body() createOrganizationDto: any) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.READ_ORGANIZATION)
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.READ_ORGANIZATION)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.UPDATE_ORGANIZATION)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateOrganizationDto: any) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.DELETE_ORGANIZATION)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.organizationsService.remove(id);
  }
}

