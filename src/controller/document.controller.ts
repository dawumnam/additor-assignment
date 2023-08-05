import express, { Request, Response } from "express";
import { DocumentService } from "../service/document.service";
import { authenticateToken } from "../middleware/auth";
import { ChangeDto } from "./interface/dto";

let documentService: DocumentService;

(async () => {
  documentService = await DocumentService.createDocumentService();
})();

const documentRouter = express.Router();

documentRouter.get(
  "/doc",
  authenticateToken,
  async (req: Request, res: Response) => {
    const doc = await documentService.getLatestDocument();
    return res.status(200).json(doc);
  }
);

documentRouter.post(
  "/change",
  authenticateToken,
  async (req: Request, res: Response) => {
    const { version, index, insertion, deletionLength } = req.body;
    const changeDto = ChangeDto.of(version, index, insertion, deletionLength);
    const doc = await documentService.updateDocument(changeDto);
    return res.status(200).json(doc);
  }
);

export default documentRouter;
