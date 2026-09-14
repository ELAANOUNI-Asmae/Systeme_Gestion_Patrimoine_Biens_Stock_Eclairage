import 'dart:convert';
import 'dart:typed_data';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../models/app_document.dart';

class BienApiException implements Exception {
  const BienApiException({
    required this.statusCode,
    required this.message,
  });

  final int statusCode;
  final String message;

  @override
  String toString() =>
      'BienApiException($statusCode): $message';
}

class BienApiListItem {
  const BienApiListItem({
    required this.type,
    required this.designation,
    required this.inventoryNumber,
    required this.status,
    required this.acquisitionDate,
    required this.raw,
    required this.documents,
    this.id,
    this.assignment,
    this.purchaseValue,
    this.archivedAt,
  });

  final int? id;
  final String? type;
  final String designation;
  final String inventoryNumber;
  final String status;
  final String acquisitionDate;
  final String? assignment;
  final double? purchaseValue;
  final String? archivedAt;
  final Map<String, dynamic> raw;
  final List<AppDocument> documents;

  factory BienApiListItem.fromJson(
    Map<String, dynamic> json, {
    String? forcedType,
  }) {
    String? text(dynamic value) {
      if (value == null) return null;

      final result =
          value
              .toString()
              .trim();

      return result.isEmpty
          ? null
          : result;
    }

    int? integer(dynamic value) {
      if (value == null) return null;
      if (value is int) return value;

      return int.tryParse(
        value.toString(),
      );
    }

    double? decimal(dynamic value) {
      if (value == null ||
          value.toString().trim().isEmpty) {
        return null;
      }

      if (value is num) {
        return value.toDouble();
      }

      return double.tryParse(
        value.toString(),
      );
    }

    String? inferType() {
      if (json.containsKey(
            'registrationNumber',
          ) ||
          json.containsKey(
            'chassisNumber',
          ) ||
          json.containsKey(
            'make',
          )) {
        return 'VEHICLE';
      }

      if (json.containsKey(
            'serialNumber',
          ) ||
          json.containsKey(
            'brand',
          ) ||
          json.containsKey(
            'model',
          )) {
        return 'MACHINE';
      }

      if (json.containsKey(
            'landTitleReference',
          ) ||
          json.containsKey(
            'cadastralReference',
          ) ||
          json.containsKey(
            'areaM2',
          ) ||
          json.containsKey(
            'realEstateType',
          )) {
        return 'REAL_ESTATE';
      }

      return null;
    }

    String? archivedAt;

    final disposal =
        json['disposal'];

    if (disposal is Map) {
      archivedAt =
          text(
            disposal[
              'disposalDate'
            ],
          );
    }

    archivedAt ??=
        text(
          json[
            'archivedAt'
          ],
        );

    archivedAt ??=
        text(
          json[
            'disposalDate'
          ],
        );

    final documents =
        <AppDocument>[];

    final rawDocuments =
        json[
          'documentResponseDtoSet'
        ];

    if (rawDocuments is List) {
      for (
        var index = 0;
        index <
            rawDocuments.length;
        index++
      ) {
        final raw =
            rawDocuments[
              index
            ];

        if (raw is! Map) {
          continue;
        }

        final document =
            Map<String, dynamic>.from(
              raw,
            );

        final path =
            text(
              document[
                'path'
              ],
            ) ??
            '';

        final normalizedPath =
            path.replaceAll(
              '\\',
              '/',
            );

        final fileName =
            normalizedPath.isEmpty
                ? 'document'
                : normalizedPath
                    .split(
                      '/',
                    )
                    .last;

        final title =
            text(
              document[
                'title_fr'
              ],
            ) ??
            text(
              document[
                'title_ar'
              ],
            ) ??
            fileName;

        final backendType =
            text(
              document[
                'documentType'
              ],
            );

        final endDateText =
            text(
              document[
                'endDate'
              ],
            );

        documents.add(
          AppDocument(
            id:
                -(index + 1),

            backendId:
                integer(
                  document[
                    'id'
                  ],
                ),

            name:
                title,

            type:
                _documentTypeFromBackend(
                  text(
                    document[
                      'type'
                    ],
                  ),
                ),

            fileName:
                fileName,

            uploadDate:
                DateTime.now(),

            category:
                backendType ==
                        'DOCUMENT_OFFICIEL'
                    ? DocumentCategory
                        .official
                    : DocumentCategory
                        .attachment,

            expirationDate:
                endDateText == null
                    ? null
                    : DateTime.tryParse(
                        endDateText,
                      ),

            reminderDaysBefore:
                integer(
                  document[
                    'alertThreshold'
                  ],
                ),
          ),
        );
      }
    }

    return BienApiListItem(
      id:
          integer(
            json[
              'id'
            ],
          ),

      type:
          forcedType ??
          inferType(),

      designation:
          text(
            json[
              'designation'
            ],
          ) ??
          '—',

      inventoryNumber:
          text(
            json[
                  'inventoryNumber'
                ] ??
                json[
                  'inventory_id'
                ],
          ) ??
          '—',

      status:
          text(
            json[
                  'assetStatus'
                ] ??
                json[
                  'asset_status'
                ],
          ) ??
          'AVAILABLE',

      acquisitionDate:
          text(
            json[
                  'acquisitionDate'
                ] ??
                json[
                  'acquisition_date'
                ],
          ) ??
          '',

      assignment:
          text(
            json[
              'assignment'
            ],
          ),

      purchaseValue:
          decimal(
            json[
                  'purchaseValue'
                ] ??
                json[
                  'purchase_value'
                ] ??
                json[
                  'acquisitionValue'
                ],
          ),

      archivedAt:
          archivedAt,

      raw:
          json,

      documents:
          documents,
    );
  }
}

class BienApiService {
  static const String _baseUrl =
      String.fromEnvironment(
        'API_BASE_URL',
        defaultValue:
            'http://127.0.0.1:8081',
      );

  static const String _cookieKey =
      'sgpbse_auth_cookie';

  static const Map<String, String>
      _typePaths = {
    'VEHICLE':
        '/sgpbse/vehicle',
    'MACHINE':
        '/sgpbse/machine',
    'REAL_ESTATE':
        '/sgpbse/real_estate',
  };

  Future<List<BienApiListItem>>
      getVehicles() =>
          _getList(
            '/sgpbse/vehicle/all',
            forcedType:
                'VEHICLE',
          );

  Future<List<BienApiListItem>>
      getMachines() =>
          _getList(
            '/sgpbse/machine/all',
            forcedType:
                'MACHINE',
          );

  Future<List<BienApiListItem>>
      getRealEstates() =>
          _getList(
            '/sgpbse/real_estate/all',
            forcedType:
                'REAL_ESTATE',
          );

  Future<List<BienApiListItem>>
      getAll() async {
    final groups =
        await Future.wait<
          List<
            BienApiListItem
          >
        >([
          getVehicles(),
          getMachines(),
          getRealEstates(),
        ]);

    return groups
        .expand(
          (
            items,
          ) =>
              items,
        )
        .toList();
  }

  Future<List<BienApiListItem>>
      getArchived() =>
          _getList(
            '/sgpbse/asset/archived',
          );

  Future<BienApiListItem>
      getAssetInfo(
    int id, {
    String? forcedType,
  }) async {
    final json =
        await _getObject(
          '/sgpbse/asset/infos/$id',
        );

    return BienApiListItem
        .fromJson(
          json,
          forcedType:
              forcedType,
        );
  }

  Future<BienApiListItem>
      getById(
    int id,
    String type,
  ) async {
    final base =
        _typePaths[
          type
        ];

    if (base == null) {
      throw const BienApiException(
        statusCode:
            400,
        message:
            'Unsupported asset type.',
      );
    }

    final json =
        await _getObject(
          '$base/$id',
        );

    return BienApiListItem
        .fromJson(
          json,
          forcedType:
              type,
        );
  }

  Future<BienApiListItem>
      create(
    String type,
    Map<String, dynamic>
        payload,
  ) async {
    final base =
        _typePaths[
          type
        ];

    if (base == null) {
      throw const BienApiException(
        statusCode:
            400,
        message:
            'Unsupported asset type.',
      );
    }

    final response =
        await _request(
          'POST',
          '$base/create',
          body:
              payload,
        );

    final decoded =
        jsonDecode(
          utf8.decode(
            response
                .bodyBytes,
          ),
        );

    if (decoded is! Map) {
      throw const BienApiException(
        statusCode:
            500,
        message:
            'Unexpected backend response.',
      );
    }

    return BienApiListItem
        .fromJson(
          Map<String, dynamic>
              .from(
            decoded,
          ),
          forcedType:
              type,
        );
  }

  Future<void> update(
    int id,
    String type,
    Map<String, dynamic>
        payload,
  ) async {
    final base =
        _typePaths[
          type
        ];

    if (base == null) {
      throw const BienApiException(
        statusCode:
            400,
        message:
            'Unsupported asset type.',
      );
    }

    await _request(
      'PUT',
      '$base/update/$id',
      body:
          payload,
    );
  }

  Future<void> remove(
    int id,
    String type,
  ) async {
    final base =
        _typePaths[
          type
        ];

    if (base == null) {
      throw const BienApiException(
        statusCode:
            400,
        message:
            'Unsupported asset type.',
      );
    }

    await _request(
      'DELETE',
      '$base/delete/$id',
    );
  }

  Future<void> updateStatus(
    int id,
    String status,
  ) async {
    const allowed = {
      'AVAILABLE',
      'IN_USE',
      'OUT_OF_SERVICE',
      'DAMAGED',
    };

    if (!allowed.contains(
      status,
    )) {
      throw const BienApiException(
        statusCode:
            400,
        message:
            'This status is managed by a business operation.',
      );
    }

    await _request(
      'POST',
      '/sgpbse/asset/update/$id',
      rawBody:
          jsonEncode(
            status,
          ),
    );
  }

  Future<int> rent(
    int assetId, {
    required String tenantName,
    required String startDate,
    required String endDate,
    required int frequency,
    required double amount,
  }) async {
    final response =
        await _request(
          'POST',
          '/sgpbse/rental/rent/$assetId',
          body: {
            'tenantName':
                tenantName,
            'startDate':
                startDate,
            'endDate':
                endDate,
            'frequency':
                frequency,
            'amount':
                amount,
          },
        );

    return _intResponse(
      response,
      'rental',
    );
  }

  Future<int> dispose(
    int assetId, {
    required String disposalDate,
    required double amount,
    required String disposalMethod,
    required String purchaser,
  }) async {
    final response =
        await _request(
          'POST',
          '/sgpbse/disposal/dispose/$assetId',
          body: {
            'disposalDate':
                disposalDate,
            'amount':
                amount,
            'disposalMethod':
                disposalMethod,
            'purchaser':
                purchaser,
          },
        );

    return _intResponse(
      response,
      'disposal',
    );
  }

  Future<void>
      uploadAssetDocuments(
    int assetId,
    List<AppDocument>
        documents,
  ) =>
          _uploadMany(
            '/sgpbse/asset/joinDoc/$assetId',
            documents,
          );

  Future<void>
      uploadRentalDocuments(
    int rentalId,
    List<AppDocument>
        documents,
  ) =>
          _uploadMany(
            '/sgpbse/rental/joinDoc/$rentalId',
            documents,
          );

  Future<void>
      uploadDisposalDocuments(
    int disposalId,
    List<AppDocument>
        documents,
  ) =>
          _uploadMany(
            '/sgpbse/disposal/joinDoc/$disposalId',
            documents,
          );

  Future<Uint8List>
      downloadDocumentBytes(
    int documentId,
  ) async {
    final cookie =
        await _requireCookie();

    final response =
        await http.get(
          Uri.parse(
            '$_baseUrl/sgpbse/document/$documentId/content',
          ),
          headers: {
            'Accept':
                '*/*',
            'Cookie':
                cookie,
          },
        );

    _ensureSuccess(
      response,
    );

    return response
        .bodyBytes;
  }

  Future<List<BienApiListItem>>
      _getList(
    String path, {
    String? forcedType,
  }) async {
    final response =
        await _request(
          'GET',
          path,
        );

    final decoded =
        jsonDecode(
          utf8.decode(
            response
                .bodyBytes,
          ),
        );

    if (decoded is! List) {
      throw const BienApiException(
        statusCode:
            500,
        message:
            'Unexpected backend response.',
      );
    }

    return decoded
        .whereType<Map>()
        .map(
          (
            item,
          ) =>
              BienApiListItem
                  .fromJson(
            Map<String, dynamic>
                .from(
              item,
            ),
            forcedType:
                forcedType,
          ),
        )
        .toList();
  }

  Future<Map<String, dynamic>>
      _getObject(
    String path,
  ) async {
    final response =
        await _request(
          'GET',
          path,
        );

    final decoded =
        jsonDecode(
          utf8.decode(
            response
                .bodyBytes,
          ),
        );

    if (decoded is! Map) {
      throw const BienApiException(
        statusCode:
            500,
        message:
            'Unexpected backend response.',
      );
    }

    return Map<String, dynamic>
        .from(
      decoded,
    );
  }

  Future<http.Response>
      _request(
    String method,
    String path, {
    Map<String, dynamic>?
        body,
    String? rawBody,
  }) async {
    final cookie =
        await _requireCookie();

    final request =
        http.Request(
          method,
          Uri.parse(
            '$_baseUrl$path',
          ),
        )
          ..headers.addAll({
            'Accept':
                'application/json',
            'Content-Type':
                'application/json',
            'Cookie':
                cookie,
          });

    if (rawBody != null) {
      request.body =
          rawBody;
    } else if (body !=
        null) {
      request.body =
          jsonEncode(
            body,
          );
    }

    final streamed =
        await request.send();

    final response =
        await http.Response
            .fromStream(
          streamed,
        );

    _ensureSuccess(
      response,
    );

    return response;
  }

  Future<String>
      _requireCookie() async {
    final preferences =
        await SharedPreferences
            .getInstance();

    final cookie =
        preferences.getString(
          _cookieKey,
        );

    if (cookie == null ||
        cookie
            .trim()
            .isEmpty) {
      throw const BienApiException(
        statusCode:
            401,
        message:
            'Authentication cookie missing.',
      );
    }

    return cookie;
  }

  void _ensureSuccess(
    http.Response response,
  ) {
    if (response.statusCode >=
            200 &&
        response.statusCode <
            300) {
      return;
    }

    throw BienApiException(
      statusCode:
          response
              .statusCode,
      message:
          utf8.decode(
        response
            .bodyBytes,
      ),
    );
  }

  int _intResponse(
    http.Response response,
    String operation,
  ) {
    final body =
        utf8.decode(
          response
              .bodyBytes,
        );

    dynamic decoded;

    try {
      decoded =
          jsonDecode(
            body,
          );
    } catch (_) {
      decoded =
          body;
    }

    if (decoded is int) {
      return decoded;
    }

    final parsed =
        int.tryParse(
          decoded
              .toString(),
        );

    if (parsed == null) {
      throw BienApiException(
        statusCode:
            500,
        message:
            'Unexpected $operation response.',
      );
    }

    return parsed;
  }

  Future<void> _uploadMany(
    String path,
    List<AppDocument>
        documents,
  ) async {
    for (final document
        in documents) {
      if (document.fileBytes ==
          null) {
        continue;
      }

      await _uploadDocument(
        path,
        document,
      );
    }
  }

  Future<void> _uploadDocument(
    String path,
    AppDocument document,
  ) async {
    final bytes =
        document.fileBytes;

    if (bytes == null) {
      return;
    }

    final cookie =
        await _requireCookie();

    final boundary =
        '----sgpbse-${DateTime.now().microsecondsSinceEpoch}';

    final data =
        BytesBuilder(
          copy:
              false,
        );

    void writeText(
      String value,
    ) {
      data.add(
        utf8.encode(
          value,
        ),
      );
    }

    String safeFileName(
      String value,
    ) =>
        value
            .replaceAll(
              '"',
              '_',
            )
            .replaceAll(
              '\r',
              '',
            )
            .replaceAll(
              '\n',
              '',
            );

    writeText(
      '--$boundary\r\n',
    );

    writeText(
      'Content-Disposition: form-data; name="file"; filename="${safeFileName(document.fileName)}"\r\n',
    );

    writeText(
      'Content-Type: application/octet-stream\r\n\r\n',
    );

    data.add(
      bytes,
    );

    writeText(
      '\r\n',
    );

    final jsonData =
        jsonEncode({
          'title_fr':
              document
                  .name,
          'title_ar':
              document
                  .name,
          'path':
              null,
          'documentType':
              document
                      .isOfficial
                  ? 'DOCUMENT_OFFICIEL'
                  : 'PIECE_JOINTE',
          'type':
              _documentTypeToBackend(
                document
                    .type,
              ),
          'endDate':
              document.isOfficial &&
                      document.expirationDate !=
                          null
                  ? _iso(
                      document
                          .expirationDate!,
                    )
                  : null,
          'alertThreshold':
              document
                      .isOfficial
                  ? document.reminderDaysBefore ??
                      7
                  : null,
        });

    writeText(
      '--$boundary\r\n',
    );

    writeText(
      'Content-Disposition: form-data; name="data"\r\n',
    );

    writeText(
      'Content-Type: application/json; charset=utf-8\r\n\r\n',
    );

    writeText(
      jsonData,
    );

    writeText(
      '\r\n--$boundary--\r\n',
    );

    final request =
        http.Request(
          'POST',
          Uri.parse(
            '$_baseUrl$path',
          ),
        )
          ..headers.addAll({
            'Accept':
                'application/json',
            'Cookie':
                cookie,
            'Content-Type':
                'multipart/form-data; boundary=$boundary',
          })
          ..bodyBytes =
              data.takeBytes();

    final streamed =
        await request.send();

    final response =
        await http.Response
            .fromStream(
          streamed,
        );

    _ensureSuccess(
      response,
    );
  }
}

String _iso(
  DateTime value,
) =>
    '${value.year.toString().padLeft(4, '0')}-'
    '${value.month.toString().padLeft(2, '0')}-'
    '${value.day.toString().padLeft(2, '0')}';

DocumentType
    _documentTypeFromBackend(
  String? value,
) {
  switch (value) {
    case 'INVOICE':
      return DocumentType
          .invoice;

    case 'RECEIPT':
      return DocumentType
          .receipt;

    case 'CONTRACT':
      return DocumentType
          .contract;

    case 'REGISTRATION':
      return DocumentType
          .registration;

    case 'INSURANCE':
      return DocumentType
          .insurance;

    case 'CERTIFICATE':
      return DocumentType
          .certificate;

    case 'DELIVERY_NOTE':
      return DocumentType
          .deliveryNote;

    case 'EXIT_VOUCHER':
      return DocumentType
          .exitVoucher;

    case 'TECHNICAL_SHEET':
      return DocumentType
          .technicalSheet;

    case 'WARRANTY':
      return DocumentType
          .warranty;

    case 'REPORT':
      return DocumentType
          .report;

    case 'PHOTO':
      return DocumentType
          .photo;

    default:
      return DocumentType
          .other;
  }
}

String _documentTypeToBackend(
  DocumentType value,
) {
  switch (value) {
    case DocumentType.invoice:
      return 'INVOICE';

    case DocumentType.receipt:
      return 'RECEIPT';

    case DocumentType.contract:
      return 'CONTRACT';

    case DocumentType.registration:
      return 'REGISTRATION';

    case DocumentType.insurance:
      return 'INSURANCE';

    case DocumentType.certificate:
      return 'CERTIFICATE';

    case DocumentType.deliveryNote:
      return 'DELIVERY_NOTE';

    case DocumentType.exitVoucher:
      return 'EXIT_VOUCHER';

    case DocumentType.technicalSheet:
      return 'TECHNICAL_SHEET';

    case DocumentType.warranty:
      return 'WARRANTY';

    case DocumentType.report:
      return 'REPORT';

    case DocumentType.photo:
      return 'PHOTO';

    case DocumentType.other:
      return 'OTHER';
  }
}
