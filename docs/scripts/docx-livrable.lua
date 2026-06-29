-- Page de garde -> TOC -> contenu (docx uniquement)

local function pagebreak()
  return pandoc.RawBlock(
    "openxml",
    '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'
  )
end

local function toc_block()
  local title = "Table des matières"
  local xml = table.concat({
    "<w:sdt>",
    "<w:sdtPr><w:docPartObj><w:docPartGallery w:val=\"Table of Contents\" />",
    "<w:docPartUnique /></w:docPartObj></w:sdtPr>",
    "<w:sdtContent>",
    "<w:p><w:pPr><w:pStyle w:val=\"TOCHeading\" /></w:pPr>",
    "<w:r><w:t xml:space=\"preserve\">" .. title .. "</w:t></w:r></w:p>",
    "<w:p><w:r>",
    "<w:fldChar w:fldCharType=\"begin\" w:dirty=\"true\" />",
    "<w:instrText xml:space=\"preserve\">TOC \\o &quot;1-2&quot; \\h \\z \\u</w:instrText>",
    "<w:fldChar w:fldCharType=\"separate\" />",
    "<w:fldChar w:fldCharType=\"end\" />",
    "</w:r></w:p>",
    "</w:sdtContent></w:sdt>",
  })
  return pandoc.RawBlock("openxml", xml)
end

function RawBlock(el)
  if FORMAT ~= "docx" then
    return nil
  end
  if el.format == "tex" then
    if el.text == "\\pagebreak" or el.text == "\\newpage" then
      return pagebreak()
    end
    if el.text == "\\toc" then
      return toc_block()
    end
  end
  return nil
end

function Para(el)
  if FORMAT ~= "docx" then
    return nil
  end
  local text = pandoc.utils.stringify(el)
  if text == "\\pagebreak" or text == "\\newpage" then
    return pagebreak()
  end
  if text == "\\toc" then
    return toc_block()
  end
  return nil
end
