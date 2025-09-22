import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/rbac.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.CREATE_TASK)
  create(@Body() createTaskDto: any, @CurrentUser() user: any) {
    return this.tasksService.create(createTaskDto, user.id);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.READ_TASK)
  findAll(@CurrentUser() user: any) {
    return this.tasksService.findAll(user.id, user.role, user.organizationId);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.READ_TASK)
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.tasksService.findOne(id, user.id, user.role, user.organizationId);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.UPDATE_TASK)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTaskDto: any, @CurrentUser() user: any) {
    return this.tasksService.update(id, updateTaskDto, user.id, user.role);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.DELETE_TASK)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.tasksService.remove(id, user.id, user.role);
  }
}
