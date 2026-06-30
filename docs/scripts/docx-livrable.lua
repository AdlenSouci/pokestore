-- Page de garde -> table des matieres (vrai champ Word, calcule par Word) -> contenu

local function marker_text(el)
  if el.t == "RawBlock" and el.format == "tex" then
    return el.text
  end
  if el.t == "Para" then
    return pandoc.utils.stringify(el)
  end
  return nil
end

local function is_pagebreak(el)
  local text = marker_text(el)
  return text == "\\pagebreak" or text == "\\newpage"
end

local function is_toc_marker(el)
  return marker_text(el) == "\\toc"
end

local function hard_pagebreak()
  return pandoc.RawBlock(
    "openxml",
    "<w:p><w:r><w:br w:type=\"page\"/></w:r></w:p>"
  )
end

-- Vrai champ Word TOC : calcule par Word a l'ouverture / a la mise a jour des
-- champs (voir update-docx-toc.vbs, appele automatiquement par le script de
-- generation). Plus fiable qu'un calcul de pages approximatif a la main.
local function real_toc_field()
  local parts = {
    '<w:p><w:pPr><w:pStyle w:val="TOCHeading"/></w:pPr>',
    '<w:r><w:t xml:space="preserve">Table des matières</w:t></w:r></w:p>',
    '<w:p><w:pPr><w:pStyle w:val="Normal"/></w:pPr>',
    '<w:r><w:fldChar w:fldCharType="begin" w:dirty="true"/></w:r>',
    '<w:r><w:instrText xml:space="preserve"> TOC \\o "1-3" \\h \\z \\u </w:instrText></w:r>',
    '<w:r><w:fldChar w:fldCharType="separate"/></w:r>',
    '<w:r><w:t xml:space="preserve">Mettre à jour les champs pour afficher la table des matières (clic droit → Mettre à jour les champs).</w:t></w:r>',
    '<w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>',
  }
  return pandoc.RawBlock("openxml", table.concat(parts))
end

function Pandoc(doc)
  if FORMAT ~= "docx" then
    return doc
  end

  local out = {}

  for _, block in ipairs(doc.blocks) do
    if is_toc_marker(block) then
      table.insert(out, real_toc_field())
    elseif is_pagebreak(block) then
      table.insert(out, hard_pagebreak())
    else
      table.insert(out, block)
    end
  end

  return pandoc.Pandoc(out, doc.meta)
end
