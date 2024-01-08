"use client";

import {
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormLabel,
  Input,
  InputProps,
  List,
  ListItem,
} from "@chakra-ui/react";
import React, { ChangeEventHandler, useState, useRef } from "react";

type DatalistInputProps = InputProps &
  FormControlProps & {
    inputError?: string;
    dataList: string[];
  };

const DatalistInput = (
  { id, label, dataList, inputError, isRequired, ...props }: DatalistInputProps,
  ref: any
) => {
  const inputRef = ref || useRef(null);

  const [listItems, setListItems] = useState<any[]>([]);

  const filterList: ChangeEventHandler = (e) => {
    e.preventDefault();
    const target = e.target as HTMLInputElement;
    const searchText = target.value.trim();
    if (searchText === "") {
      setListItems([]);
      return;
    }

    const filteredList = dataList.filter((item) =>
      item.toLowerCase().includes(searchText.toLowerCase())
    );
    setListItems(filteredList);
  };

  const selectValue = (value: string) => {
    inputRef!.current.value = value;
    setListItems([]);
  };

  return (
    <FormControl
      isInvalid={inputError !== undefined && inputError !== ""}
      position={"relative"}
      isRequired={isRequired}
    >
      {label && (
        <FormLabel mb={0} fontSize={"xl"} color={"text.700"} htmlFor={id}>
          {label}
        </FormLabel>
      )}
      <Input
        id={id}
        onChange={filterList}
        isRequired={isRequired}
        {...props}
        border={"stroke"}
        borderRadius={"full"}
        h="10"
        autoComplete="off"
        ref={inputRef}
      />
      {inputError && <FormErrorMessage mt="0">{inputError}</FormErrorMessage>}
      {listItems.length !== 0 && (
        <List
          position={"absolute"}
          shadow={"xl"}
          zIndex={10}
          bg={"white"}
          width={"full"}
          border="1px"
          borderRadius={"md"}
          maxH={"200px"}
          overflowY={"scroll"}
        >
          {listItems.map((item, index) => (
            <ListItem
              key={index}
              p={1}
              borderBottom={"1px"}
              _hover={{ backgroundColor: "gray.200" }}
              cursor={"pointer"}
              onClick={() => selectValue(item)}
            >
              {item}
            </ListItem>
          ))}
        </List>
      )}
    </FormControl>
  );
};

export default React.forwardRef(DatalistInput);
