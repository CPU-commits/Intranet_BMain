import { BadRequestException, Injectable } from '@nestjs/common'
import * as XLSX from 'xlsx'
import { ExcelDTO } from '../../dtos/excel.dto'

@Injectable()
export class ExcelService {
    async readFileExcel(file: Express.Multer.File, excel: ExcelDTO) {
        const workbook = XLSX.read(file.buffer)
        if (
            !workbook?.Workbook?.Sheets.some((sheet) =>
                excel.sheets.includes(sheet.name),
            )
        )
            throw new BadRequestException(
                `Las hojas "${excel.sheets.join(', ')}" son requeridas`,
            )
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return Object.entries(workbook.Sheets).map(([sheetName, _]) => ({
            sheet: sheetName,
            values: XLSX.utils
                .sheet_to_json(workbook.Sheets[sheetName])
                .map((row) => {
                    if (typeof row !== 'object')
                        throw new BadRequestException('Row must be a object')
                    // Transformer
                    const map = new Map(Object.entries(row))
                    excel?.transformer?.forEach(({ key, value }) => {
                        const mapValue = map.get(key)
                        if (mapValue) {
                            map.set(value, mapValue)
                            map.delete(key)
                        }
                    })

                    return Object.fromEntries(map)
                }),
        }))
    }
}
