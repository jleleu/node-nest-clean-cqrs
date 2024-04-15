import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { ZodValidationPipe } from '../../core/pipes/zod-validation.pipe';
import { WebinarAPI } from '../contract';
import { QueryBus } from '@nestjs/cqrs';
import { GetWebinarByIdQuery } from '../read-side/queries/get-webinar-by-id';
import { OrganizeWebinar } from '../write-side/commands/organize-webinar';
import { ChangeSeats } from '../write-side/commands/change-seats';
import { ChangeDates } from '../write-side/commands/change-dates';
import { CancelWebinar } from '../write-side/commands/cancel-webinar';

@Controller()
export class WebinarController {
  constructor(
    private readonly organizeWebinar: OrganizeWebinar,
    private readonly changeSeats: ChangeSeats,
    private readonly changeDates: ChangeDates,
    private readonly cancelWebinar: CancelWebinar,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('/webinars/:id')
  async handleGetWebinarById(
    @Param('id') id: string,
  ): Promise<WebinarAPI.GetWebinar.Response> {
    return this.queryBus.execute(new GetWebinarByIdQuery(id));
  }

  @Post('/webinars')
  async handleOrganizeWebinar(
    @Body(new ZodValidationPipe(WebinarAPI.OrganizeWebinar.schema))
    body: WebinarAPI.OrganizeWebinar.Request,
    @Request() request: { user: User },
  ): Promise<WebinarAPI.OrganizeWebinar.Response> {
    return this.organizeWebinar.execute({
      user: request.user,
      title: body.title,
      seats: body.seats,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    });
  }

  @HttpCode(200)
  @Post('/webinars/:id/seats')
  async handleChangeSeats(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(WebinarAPI.ChangeSeats.schema))
    body: WebinarAPI.ChangeSeats.Request,
    @Request() request: { user: User },
  ): Promise<WebinarAPI.ChangeSeats.Response> {
    return this.changeSeats.execute({
      user: request.user,
      webinarId: id,
      seats: body.seats,
    });
  }

  @HttpCode(200)
  @Post('/webinars/:id/dates')
  async handleChangeDates(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(WebinarAPI.ChangeDates.schema))
    body: WebinarAPI.ChangeDates.Request,
    @Request() request: { user: User },
  ): Promise<WebinarAPI.ChangeDates.Response> {
    return this.changeDates.execute({
      user: request.user,
      webinarId: id,
      startDate: body.startDate,
      endDate: body.endDate,
    });
  }

  @HttpCode(200)
  @Delete('/webinars/:id')
  async handleCancelWebinar(
    @Param('id') id: string,
    @Request() request: { user: User },
  ): Promise<WebinarAPI.CancelWebinar.Response> {
    return this.cancelWebinar.execute({
      user: request.user,
      webinarId: id,
    });
  }
}
