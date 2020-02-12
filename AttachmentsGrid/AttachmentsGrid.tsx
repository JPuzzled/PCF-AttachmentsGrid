import * as React from 'react';
import { Card, ICardTokens, ICardSectionStyles, ICardSectionTokens } from '@uifabric/react-cards';
import { FontWeights } from '@uifabric/styling';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import {
  Icon,
  IIconStyles,
  Persona,
  Stack,
  IStackTokens,
  Text,
  ITextStyles,
  PersonaSize
} from 'office-ui-fabric-react';
import { format } from 'timeago.js';
import filesize from 'filesize';
import { IXrmAttachmentControlState } from './IXrmAttachmentControlState';
import { IXrmAttachmentControlProps } from './IXrmAttachmentControlProps';
import Dropzone from 'react-dropzone'
import { DropHandler } from "./drophandler/drophandler";
import { Attachment } from './Attachment';
import { EntityReference } from './EntityReference';
// Helper imports to generate data for this particular examples. Not exported by any package.

const stackTokens: IStackTokens = { childrenGap: 10 };

const alertClicked = (): void => {
  alert('Clicked');
};

const siteTextStyles: ITextStyles = {
  root: {
    color: '#025F52',
    fontWeight: FontWeights.semibold
  }
};
const descriptionTextStyles: ITextStyles = {
  root: {
    color: '#333333',
    fontWeight: FontWeights.semibold
  }
};
const helpfulTextStyles: ITextStyles = {
  root: {
    color: '#333333',
    fontWeight: FontWeights.regular
  }
};
const iconStyles: IIconStyles = {
  root: {
    color: '#0078D4',
    fontSize: 16,
    fontWeight: FontWeights.regular
  }
};
const footerCardSectionStyles: ICardSectionStyles = {
  root: {
    borderTop: '1px solid #F3F2F1'
  }
};

const cardTokens: ICardTokens = { childrenMargin: 12 };
const footerCardSectionTokens: ICardSectionTokens = { padding: '12px 0px 0px' };

export class XrmAttachmentControl extends React.Component<IXrmAttachmentControlProps, IXrmAttachmentControlState> {
  constructor(props: IXrmAttachmentControlProps) {
    super(props);
    this.state = {
      attachments: props.defaultAttachments,
      progressShow: false,
      progressTotalFilesToUpload: 0,
      progressCurrentFilesUploaded: 0
    };
  }

  private async handleFiles(file: File) {

      var encodedData = await this.EncodeFile(file);

      var attachment = {
        "subject": `Attachment: ${file.name}`,
        "filename": file.name,
        "filesize": file.size,
        "mimetype": file.type,
        "objecttypecode": this.props.entityReference.typeName,
        "documentbody": encodedData,
        [`objectid_${this.props.entityReference.typeName}@odata.bind`]: `/${this.CollectionNameFromLogicalName(this.props.entityReference.typeName)}(${this.props.entityReference.id})`
      };

      //var response = await this.props.webApi.createRecord('annotation', attachment);

      this.setState(
        {
          attachments: this.state.attachments.concat({
            id: '1',
            name: file.name,
            icon: "WordDocument",
            filename: file.name,
            fileextension: file.type,
            size: file.size,
            createdBy: "Ben Bartle",
            createdOn: new Date()
          }),
          progressCurrentFilesUploaded: this.state.progressCurrentFilesUploaded + 1
        });
  }

  private EncodeFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (f) => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  private CollectionNameFromLogicalName(entityLogicalName: string): string {
    if (entityLogicalName[entityLogicalName.length - 1] != 's') {
      return `${entityLogicalName}s`;
    } else {
      return `${entityLogicalName}es`;
    }
  }

  private GetFileExtension(fileName: string): string {
    return fileName.split('.').pop() as string;
  }

  private TrimFileExtension(fileName: string): string {
    return fileName.split('.')[0];
  }

  public render(): JSX.Element {

    let list = this.state.attachments.map(attachment => {
      return (
        <Card tokens={cardTokens}>
          <Card.Section>
            <Icon iconName={attachment.icon} styles={iconStyles} />
            <Text variant="small" styles={siteTextStyles}>
              {attachment.filename}.{attachment.fileextension}
            </Text>
            <Text styles={descriptionTextStyles}>{attachment.name}</Text>
          </Card.Section>
          <Card.Item>
            <Persona size={PersonaSize.size40} text={attachment.createdBy} secondaryText={format(attachment.createdOn)} />
          </Card.Item>
          <Card.Section horizontal styles={footerCardSectionStyles} tokens={footerCardSectionTokens}>
            <Icon iconName="Delete" styles={iconStyles} onClick={alertClicked} />
            <Stack.Item grow={1}>
              <span />
            </Stack.Item>
            <Text variant="small" styles={helpfulTextStyles}>
              {filesize(attachment.size)}
            </Text>
          </Card.Section>
        </Card>
      );
    });
    return (
      <Dropzone onDrop={acceptedFiles => {
        acceptedFiles.forEach(f => this.handleFiles(f as File))
        this.setState({
          progressShow: true,
          progressTotalFilesToUpload: acceptedFiles.length,
          progressCurrentFilesUploaded: 0
        });
      }}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            {this.state.progressShow ? <ProgressIndicator label="Uploading..." description={this.state.progressCurrentFilesUploaded + "/" + this.state.progressTotalFilesToUpload} percentComplete={this.state.progressCurrentFilesUploaded / this.state.progressTotalFilesToUpload} /> : null}
            <Stack horizontalAlign="center" horizontal wrap tokens={stackTokens}>{list}</Stack>
          </div>
        )}
      </Dropzone>);
  }

}