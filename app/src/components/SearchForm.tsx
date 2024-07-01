'use client'

import isValidURL from '@/lib/isValidURL'
import { ImageFile } from '@/types/ImageFile'
import { Button, FormControl, FormHelperText, FormLabel, Input, InputGroup, InputLeftAddon } from '@chakra-ui/react'
import { DocumentPlusIcon } from '@heroicons/react/24/outline'
import { ChangeEvent, useState } from 'react'

interface SearchFormProps {
  onChange: (url: string | ImageFile[]) => void
  onLoad: () => void
}

function SearchForm({ onChange, onLoad }: SearchFormProps) {
  const [url, setUrl] = useState('')

  const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target

    setUrl(value)

    if (isValidURL(value)) {
      onChange(value)
      onLoad()
    }
  }

  const handleFileUpload = () => {
    const input = document.createElement('input')
    const filesContents: ImageFile[] = []

    input.type = 'file'
    input.accept = 'image/*, video/*'
    input.multiple = true
    input.onchange = (event) => {
      const files = (event.target as HTMLInputElement).files

      if (!files) {
        return
      }

      for (const file of Object.values(files)) {
        const reader = new FileReader()

        reader.onload = (e) => {
          const data = e.target?.result

          if (typeof data === 'string') {
            filesContents.push({
              data,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              fileName: file.name,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              type: file.type,
            })

            if (filesContents.length === files.length) {
              onChange(filesContents)
              onLoad()
            }
          }
        }

        reader.readAsDataURL(file)
      }
    }

    input.click()
  }

  return (
    <FormControl isRequired>
      <FormLabel color="orange.600">Product URL, Screenshots or Video</FormLabel>
      <InputGroup>
        <InputLeftAddon
          as={Button}
          variant="ghost"
          bg="rgb(230, 229, 224)"
          onClick={handleFileUpload}
        >
          <DocumentPlusIcon
            width="16px"
            height="16px"
          />
        </InputLeftAddon>
        <Input
          bg="rgb(230, 229, 224)"
          autoFocus
          onChange={handleUrlChange}
          value={url}
          placeholder="Paste URL, upload showcase images or videos"
          focusBorderColor="orange.300"
        />
      </InputGroup>
      <FormHelperText color="gray.600">
        Visionary will visit the URL or video, create screenshots of it&apos;s contents and assist in iterating over the
        product&apos;s vision
      </FormHelperText>
    </FormControl>
  )
}

export default SearchForm
