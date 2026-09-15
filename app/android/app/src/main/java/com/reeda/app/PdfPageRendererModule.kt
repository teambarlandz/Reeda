package com.reeda.app

import android.graphics.Bitmap
import android.graphics.Color
import android.os.ParcelFileDescriptor
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import io.legere.pdfiumandroid.PdfDocument
import io.legere.pdfiumandroid.PdfPage
import io.legere.pdfiumandroid.PdfTextPage
import io.legere.pdfiumandroid.PdfiumCore
import java.io.File
import java.io.FileOutputStream

/**
 * Tiny bridge over the Pdfium engine already present via react-native-pdf.
 * Provides page-text extraction, page rasterisation (for OCR), and page count.
 * phase-4.md F2 (pdfjs fallback) + F3 (OCR image source).
 */
class PdfPageRendererModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "PdfPageRenderer"

  @ReactMethod
  fun getPageCount(pdfPath: String, promise: Promise) {
    var pfd: ParcelFileDescriptor? = null
    var doc: PdfDocument? = null
    try {
      val core = PdfiumCore(reactApplicationContext)
      pfd = ParcelFileDescriptor.open(File(pdfPath), ParcelFileDescriptor.MODE_READ_ONLY)
      doc = core.newDocument(pfd)
      promise.resolve(doc.getPageCount().toDouble())
    } catch (e: Exception) {
      promise.reject("E_PDF_COUNT", e)
    } finally {
      try { doc?.close() } catch (_: Throwable) {}
      try { pfd?.close() } catch (_: Throwable) {}
    }
  }

  @ReactMethod
  fun renderPageToFile(pdfPath: String, pageIndex: Int, outputPath: String, scale: Double, promise: Promise) {
    var pfd: ParcelFileDescriptor? = null
    var doc: PdfDocument? = null
    var page: PdfPage? = null
    try {
      val core = PdfiumCore(reactApplicationContext)
      pfd = ParcelFileDescriptor.open(File(pdfPath), ParcelFileDescriptor.MODE_READ_ONLY)
      doc = core.newDocument(pfd)
      if (pageIndex < 0 || pageIndex >= doc.getPageCount()) {
        promise.reject("E_PDF_PAGE", "pageIndex out of range")
        return
      }
      page = doc.openPage(pageIndex)
      val widthPt = page.getPageWidthPoint()
      val heightPt = page.getPageHeightPoint()
      if (widthPt <= 0 || heightPt <= 0) {
        promise.reject("E_PDF_RENDER", "invalid page dimensions")
        return
      }
      val width = (widthPt * scale).toInt().coerceAtLeast(1)
      val height = (heightPt * scale).toInt().coerceAtLeast(1)
      val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
      try {
        bitmap.eraseColor(Color.WHITE)
        page.renderPageBitmap(bitmap, 0, 0, width, height, true, true)
        val out = File(outputPath)
        out.parentFile?.mkdirs()
        FileOutputStream(out).use { fos ->
          if (!bitmap.compress(Bitmap.CompressFormat.JPEG, 85, fos)) {
            promise.reject("E_PDF_RENDER", "compress failed")
            return
          }
        }
        promise.resolve("file://$outputPath")
      } finally {
        bitmap.recycle()
      }
    } catch (e: Exception) {
      promise.reject("E_PDF_RENDER", e)
    } finally {
      try { page?.close() } catch (_: Throwable) {}
      try { doc?.close() } catch (_: Throwable) {}
      try { pfd?.close() } catch (_: Throwable) {}
    }
  }

  @ReactMethod
  fun getPageTexts(pdfPath: String, promise: Promise) {
    var pfd: ParcelFileDescriptor? = null
    var doc: PdfDocument? = null
    var page: PdfPage? = null
    var textPage: PdfTextPage? = null
    try {
      val core = PdfiumCore(reactApplicationContext)
      pfd = ParcelFileDescriptor.open(File(pdfPath), ParcelFileDescriptor.MODE_READ_ONLY)
      doc = core.newDocument(pfd)
      val out: WritableArray = Arguments.createArray()
      for (i in 0 until doc.getPageCount()) {
        page = doc.openPage(i)
        textPage = page.openTextPage()
        val count = textPage.textPageCountChars()
        val text = if (count > 0) textPage.textPageGetText(0, count) else ""
        out.pushString(text)
        textPage.close()
        textPage = null
        page.close()
        page = null
      }
      promise.resolve(out)
    } catch (e: Exception) {
      promise.reject("E_PDF_TEXT", e)
    } finally {
      try { textPage?.close() } catch (_: Throwable) {}
      try { page?.close() } catch (_: Throwable) {}
      try { doc?.close() } catch (_: Throwable) {}
      try { pfd?.close() } catch (_: Throwable) {}
    }
  }
}
