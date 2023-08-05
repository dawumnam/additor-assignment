import { Change } from "../model/changes";
import { ChangeRepositoryImpl } from "../repository/change.repository";
import { ChangeRepository } from "../repository/interface/change.repository.interface";

class ChangeService {
  constructor(private readonly changeRepository: ChangeRepository) {
    this.changeRepository = ChangeRepositoryImpl.getInstance();
  }

  async createChange(
    targetVersion: number,
    changeDelta: string
  ): Promise<Change> {
    return await this.changeRepository.create(
      new Change(changeDelta, targetVersion)
    );
  }

  async getChangeByVersion(version: number): Promise<Change | null> {
    return await this.changeRepository.findByVersion(version);
  }
}
