import { Controller, Delete, Param, Post, Request } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { WebinarAPI } from '../contract';
import { CommandBus } from '@nestjs/cqrs';
import { ReserveSeatCommand } from '../write-side/commands/reserve-seat';
import { CancelSeat } from '../write-side/commands/cancel-seat';

@Controller()
export class ParticipationController {
  constructor(
    private readonly cancelSeat: CancelSeat,
    private readonly commandBus: CommandBus,
  ) {}

  @Post('/webinars/:id/participations')
  async handleReserveSeat(
    @Param('id') id: string,
    @Request() request: { user: User },
  ): Promise<WebinarAPI.ReserveSeat.Response> {
    return this.commandBus.execute(new ReserveSeatCommand(request.user, id));
  }

  @Delete('/webinars/:id/participations')
  async handleCancelSeat(
    @Param('id') id: string,
    @Request() request: { user: User },
  ): Promise<WebinarAPI.CancelSeat.Response> {
    return this.cancelSeat.execute({
      user: request.user,
      webinarId: id,
    });
  }
}
