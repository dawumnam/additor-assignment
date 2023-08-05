import { ChangeDto } from "../controller/interface/dto";
import { Change } from "../model/changes";
import { ChangeRepositoryImpl } from "../repository/change.repository";
import { DocumentRepositoryImpl } from "../repository/document.repository";
import { ChangeRepository } from "../repository/interface/change.repository.interface";
import { DocumentRepository } from "../repository/interface/document.repository.interface";
import { createDelta } from "../util/delta";
import { stringToPlainTextDelta } from "../util/util";
import {
  handleUpdateToLatestVersion,
  handleUpdateToPreviousVersion,
} from "./util/document.util";

export class DocumentService {
  private documentRepository: DocumentRepository;
  private changeRepository: ChangeRepository;

  private constructor(documentRepository: DocumentRepository) {
    this.documentRepository = documentRepository;
    this.changeRepository = ChangeRepositoryImpl.getInstance();
  }

  static async createDocumentService() {
    const documentRepository = await DocumentRepositoryImpl.getInstance();
    return new DocumentService(documentRepository);
  }

  async updateDocument(
    changeDto: ChangeDto
  ): Promise<{ content: string; version: number }> {
    let response;
    const { version, index, insertion, deletionLength } = changeDto;

    const delta = createDelta(index, insertion, deletionLength);
    const latestDoc = await this.documentRepository.getLatestDocument();
    const latestDocDelta = stringToPlainTextDelta(latestDoc.content);
    const changes = await this.changeRepository.findAll();

    if (version === latestDoc.version) {
      response = handleUpdateToLatestVersion(latestDocDelta, delta);
    } else {
      response = handleUpdateToPreviousVersion(
        latestDocDelta,
        latestDoc.version,
        version,
        delta,
        changes
      );
    }

    const { content, invertedDelta } = response;
    await this.changeRepository.create(
      new Change(JSON.stringify(invertedDelta), latestDoc.version)
    );
    await this.documentRepository.updateDocument(
      content,
      latestDoc.version + 1
    );
    return { content, version: latestDoc.version };
  }

  async getLatestDocument(): Promise<{ content: string; version: number }> {
    const doc = await this.documentRepository.getLatestDocument();
    const { content, version } = doc;
    return { content, version };
  }
}
